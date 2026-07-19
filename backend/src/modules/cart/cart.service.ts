import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ProductVariant, ProductVariantDocument } from '../catalog/schemas/product-variant.schema';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

export interface CartWithToken {
  cart: CartDocument;
  guestToken: string;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariantDocument>,
  ) {}

  /**
   * Resolves the active cart for this request. If no token is given (or it
   * doesn't match an active cart), a fresh guest cart + token is created —
   * the controller is responsible for sending that token back to the client
   * (e.g. as a response header) so it can be reused on the next request.
   */
  async getOrCreateCart(guestToken?: string): Promise<CartWithToken> {
    if (guestToken) {
      const existing = await this.cartModel.findOne({ guestToken, status: 'active' });
      if (existing) return { cart: existing, guestToken };
    }

    const newToken = randomBytes(24).toString('hex');
    const cart = await this.cartModel.create({
      guestToken: newToken,
      customerId: null,
      items: [],
      status: 'active',
    });

    return { cart, guestToken: newToken };
  }

  async getCartView(guestToken?: string) {
    const { cart, guestToken: token } = await this.getOrCreateCart(guestToken);
    return this.toCartView(cart, token);
  }

  async addItem(guestToken: string | undefined, dto: AddCartItemDto) {
    const { cart, guestToken: token } = await this.getOrCreateCart(guestToken);

    const variant = await this.variantModel.findById(dto.variantId);
    if (!variant || !variant.isActive) {
      throw new NotFoundException('Product variant not found or unavailable');
    }

    const existingLine = cart.items.find((i) => i.variantId.toString() === dto.variantId);
    if (existingLine) {
      existingLine.quantity += dto.quantity;
      existingLine.priceCentsSnapshot = variant.priceCents; // refresh snapshot to current price
    } else {
      cart.items.push({
        variantId: new Types.ObjectId(dto.variantId),
        quantity: dto.quantity,
        priceCentsSnapshot: variant.priceCents,
      } as any);
    }

    await cart.save();
    return this.toCartView(cart, token);
  }

  async updateItem(guestToken: string | undefined, variantId: string, dto: UpdateCartItemDto) {
    const { cart, guestToken: token } = await this.getOrCreateCart(guestToken);

    const lineIndex = cart.items.findIndex((i) => i.variantId.toString() === variantId);
    if (lineIndex === -1) throw new NotFoundException('Item not in cart');

    if (dto.quantity === 0) {
      cart.items.splice(lineIndex, 1);
    } else {
      cart.items[lineIndex].quantity = dto.quantity;
    }

    await cart.save();
    return this.toCartView(cart, token);
  }

  async removeItem(guestToken: string | undefined, variantId: string) {
    return this.updateItem(guestToken, variantId, { quantity: 0 });
  }

  /** Used by checkout — re-reads live prices/availability right before reserving stock. */
  async getCartForCheckout(guestToken: string) {
    const cart = await this.cartModel.findOne({ guestToken, status: 'active' });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }
    return cart;
  }

  async markConverted(cartId: Types.ObjectId) {
    await this.cartModel.updateOne({ _id: cartId }, { $set: { status: 'converted' } });
  }

  private async toCartView(cart: CartDocument, guestToken: string) {
    const variantIds = cart.items.map((i) => i.variantId);
    const variants = await this.variantModel.find({ _id: { $in: variantIds } }).lean();
    const variantById = new Map(variants.map((v) => [v._id.toString(), v]));

    const items = cart.items.map((item) => {
      const variant = variantById.get(item.variantId.toString());
      return {
        variantId: item.variantId.toString(),
        quantity: item.quantity,
        priceCentsSnapshot: item.priceCentsSnapshot,
        currentPriceCents: variant?.priceCents ?? null,
        sku: variant?.sku ?? null,
        imageUrl: variant?.imageUrl ?? null,
        isAvailable: Boolean(variant?.isActive),
      };
    });

    const subtotalCents = items.reduce(
      (sum, item) => sum + (item.currentPriceCents ?? item.priceCentsSnapshot) * item.quantity,
      0,
    );

    return {
      guestToken,
      items,
      subtotalCents,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  }
}
