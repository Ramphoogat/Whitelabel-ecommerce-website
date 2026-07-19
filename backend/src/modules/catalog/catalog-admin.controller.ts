import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogService } from './catalog.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { JwtStaffGuard } from '../../shared/guards/jwt-staff.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';

@ApiTags('admin-catalog')
@ApiBearerAuth()
@UseGuards(JwtStaffGuard, RolesGuard)
@Roles('owner', 'admin', 'staff')
@Controller('admin/catalog')
export class CatalogAdminController {
  constructor(private readonly catalogService: CatalogService) {}

  // ----- Categories -----

  @Post('categories')
  @ApiOperation({ summary: 'Create a category' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'List all categories' })
  listCategories() {
    return this.catalogService.listCategories();
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update a category' })
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.catalogService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiOperation({ summary: 'Delete a category' })
  deleteCategory(@Param('id') id: string) {
    return this.catalogService.deleteCategory(id);
  }

  // ----- Products -----

  @Post('products')
  @ApiOperation({ summary: 'Create a product (draft by default)' })
  createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Get one product with its variants, for editing' })
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProductForAdmin(id);
  }

  @Patch('products/:id')
  @ApiOperation({ summary: 'Update a product' })
  updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product and all its variants' })
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }

  // ----- Variants -----

  @Post('variants')
  @ApiOperation({ summary: 'Add a variant (SKU) to a product' })
  createVariant(@Body() dto: CreateVariantDto) {
    return this.catalogService.createVariant(dto);
  }

  @Patch('variants/:id')
  @ApiOperation({ summary: 'Update a variant' })
  updateVariant(@Param('id') id: string, @Body() dto: UpdateVariantDto) {
    return this.catalogService.updateVariant(id, dto);
  }

  @Delete('variants/:id')
  @ApiOperation({ summary: 'Delete a variant' })
  deleteVariant(@Param('id') id: string) {
    return this.catalogService.deleteVariant(id);
  }
}
