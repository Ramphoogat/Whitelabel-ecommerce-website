import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banner, BannerDocument, BannerPosition } from './schemas/banner.schema';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(@InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>) {}

  async create(dto: CreateBannerDto) {
    return this.bannerModel.create(dto);
  }

  async listForAdmin() {
    return this.bannerModel.find().sort({ position: 1, displayOrder: 1 }).lean();
  }

  async update(id: string, dto: UpdateBannerDto) {
    const banner = await this.bannerModel.findByIdAndUpdate(id, dto, { new: true });
    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async delete(id: string) {
    const banner = await this.bannerModel.findByIdAndDelete(id);
    if (!banner) throw new NotFoundException('Banner not found');
    return { success: true };
  }

  /** Storefront: active banners for a position, respecting startsAt/endsAt scheduling. */
  async listActiveForPosition(position: BannerPosition) {
    const now = new Date();
    return this.bannerModel
      .find({
        position,
        isActive: true,
        $and: [
          { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
          { $or: [{ endsAt: null }, { endsAt: { $gte: now } }] },
        ],
      })
      .sort({ displayOrder: 1 })
      .lean();
  }
}
