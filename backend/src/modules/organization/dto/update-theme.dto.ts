import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, Matches } from 'class-validator';

const FONT_KEYS = ['grotesk', 'inter', 'plexmono', 'system', 'serif', 'cormorant', 'playfair', 'fraunces'];

const HOME_SECTION_KEYS = [
  'categories',
  'arrivals',
  'campaign',
  'values',
  'testimonials',
  'collection',
  'blog',
];

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const HEX_MESSAGE = 'must be a 6-digit hex colour like #4b9ec4';

export class UpdateThemeDto {
  // Brand colours
  @ApiPropertyOptional({ example: '#4b9ec4' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `accent ${HEX_MESSAGE}` })
  accent?: string;

  @ApiPropertyOptional({ example: '#0c2431' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `accentInk ${HEX_MESSAGE}` })
  accentInk?: string;

  @ApiPropertyOptional({ example: '#dcecf4' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `accentSoft ${HEX_MESSAGE}` })
  accentSoft?: string;

  @ApiPropertyOptional({ example: '#74b0a0' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `secondary ${HEX_MESSAGE}` })
  secondary?: string;

  @ApiPropertyOptional({ example: '#dceee7' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `secondarySoft ${HEX_MESSAGE}` })
  secondarySoft?: string;

  // Storefront canvas
  @ApiPropertyOptional({ example: '#f6f3ec' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `background ${HEX_MESSAGE}` })
  background?: string;

  @ApiPropertyOptional({ example: '#fdfbf7' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `surface ${HEX_MESSAGE}` })
  surface?: string;

  @ApiPropertyOptional({ example: '#232830' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `ink ${HEX_MESSAGE}` })
  ink?: string;

  @ApiPropertyOptional({ example: '#7c828c' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `inkSoft ${HEX_MESSAGE}` })
  inkSoft?: string;

  @ApiPropertyOptional({ example: '#e4e0d4' })
  @IsOptional()
  @Matches(HEX_COLOR, { message: `line ${HEX_MESSAGE}` })
  line?: string;

  // Typography
  @ApiPropertyOptional({ example: 'grotesk', enum: FONT_KEYS })
  @IsOptional()
  @IsIn(FONT_KEYS)
  fontDisplay?: string;

  @ApiPropertyOptional({ example: 'inter', enum: FONT_KEYS })
  @IsOptional()
  @IsIn(FONT_KEYS)
  fontBody?: string;

  @ApiPropertyOptional({ example: 'plexmono', enum: ['plexmono', 'sysmono'] })
  @IsOptional()
  @IsIn(['plexmono', 'sysmono'])
  fontMono?: string;

  @ApiPropertyOptional({ example: 'regular', enum: ['compact', 'regular', 'large'] })
  @IsOptional()
  @IsIn(['compact', 'regular', 'large'])
  typeScale?: string;

  @ApiPropertyOptional({ example: 'classic', enum: ['subtle', 'classic', 'dramatic'] })
  @IsOptional()
  @IsIn(['subtle', 'classic', 'dramatic'])
  headingScale?: string;

  // Shape
  @ApiPropertyOptional({ example: 'soft', enum: ['sharp', 'soft', 'round'] })
  @IsOptional()
  @IsIn(['sharp', 'soft', 'round'])
  cornerStyle?: string;

  // Structural: storefront
  @ApiPropertyOptional({ example: 'split', enum: ['split', 'centered', 'minimal'] })
  @IsOptional()
  @IsIn(['split', 'centered', 'minimal'])
  headerStyle?: string;

  @ApiPropertyOptional({ example: 'editorial', enum: ['editorial', 'immersive', 'minimal'] })
  @IsOptional()
  @IsIn(['editorial', 'immersive', 'minimal'])
  heroVariant?: string;

  @ApiPropertyOptional({ example: 4, enum: [2, 3, 4] })
  @IsOptional()
  @IsIn([2, 3, 4])
  gridDensity?: number;

  @ApiPropertyOptional({ example: 'glass', enum: ['glass', 'flat', 'outlined'] })
  @IsOptional()
  @IsIn(['glass', 'flat', 'outlined'])
  cardStyle?: string;

  @ApiPropertyOptional({ example: 'regular', enum: ['airy', 'regular', 'dense'] })
  @IsOptional()
  @IsIn(['airy', 'regular', 'dense'])
  sectionSpacing?: string;

  @ApiPropertyOptional({ example: 'top', enum: ['top', 'sidebar'] })
  @IsOptional()
  @IsIn(['top', 'sidebar'])
  navStyle?: string;

  @ApiPropertyOptional({ example: 'vertical', enum: ['vertical', 'horizontal', 'overlay'] })
  @IsOptional()
  @IsIn(['vertical', 'horizontal', 'overlay'])
  cardLayout?: string;

  @ApiPropertyOptional({ example: 'columns', enum: ['columns', 'centered', 'minimal'] })
  @IsOptional()
  @IsIn(['columns', 'centered', 'minimal'])
  footerStyle?: string;

  @ApiPropertyOptional({ example: ['categories', 'arrivals', 'collection'], enum: HOME_SECTION_KEYS, isArray: true })
  @IsOptional()
  @IsArray()
  @IsIn(HOME_SECTION_KEYS, { each: true })
  homeSections?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  productSlider?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  backToTop?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smoothScroll?: boolean;

  // Structural: admin panel
  @ApiPropertyOptional({ example: 'expanded', enum: ['expanded', 'compact', 'rail'] })
  @IsOptional()
  @IsIn(['expanded', 'compact', 'rail'])
  sidebarStyle?: string;

  @ApiPropertyOptional({ example: 'comfortable', enum: ['comfortable', 'compact'] })
  @IsOptional()
  @IsIn(['comfortable', 'compact'])
  density?: string;

  @ApiPropertyOptional({ example: 'card', enum: ['card', 'flat'] })
  @IsOptional()
  @IsIn(['card', 'flat'])
  panelStyle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  darkModeDefault?: boolean;
}
