import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVariantDto } from './create-variant.dto';

// productId + initialQuantity don't make sense on update — productId never
// changes, and stock changes go through the Inventory module, not here.
export class UpdateVariantDto extends PartialType(
  OmitType(CreateVariantDto, ['productId', 'initialQuantity'] as const),
) {}
