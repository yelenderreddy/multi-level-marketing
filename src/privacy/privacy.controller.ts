import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { PrivacyService } from './privacy.service';
import { CreatePrivacyDto, UpdatePrivacyDto } from './privacy.dto';

@Controller('privacy')
export class PrivacyController {
  constructor(private readonly privacyService: PrivacyService) {}

  @Post()
  async createPrivacy(@Body() createPrivacyDto: CreatePrivacyDto) {
    const privacy = await this.privacyService.createPrivacy(createPrivacyDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Privacy policy created successfully',
      data: privacy,
    };
  }

  @Get()
  async getAllPrivacy() {
    const privacy = await this.privacyService.getAllPrivacy();
    return {
      statusCode: HttpStatus.OK,
      message: 'Privacy policies retrieved successfully',
      data: privacy,
    };
  }

  @Get('active')
  async getActivePrivacy() {
    const privacy = await this.privacyService.getActivePrivacy();
    return {
      statusCode: HttpStatus.OK,
      message: 'Active privacy policy retrieved successfully',
      data: privacy,
    };
  }

  @Get(':id')
  async getPrivacyById(@Param('id') id: string) {
    const privacy = await this.privacyService.getPrivacyById(parseInt(id));
    return {
      statusCode: HttpStatus.OK,
      message: 'Privacy policy retrieved successfully',
      data: privacy,
    };
  }

  @Put(':id')
  async updatePrivacy(
    @Param('id') id: string,
    @Body() updatePrivacyDto: UpdatePrivacyDto,
  ) {
    const privacy = await this.privacyService.updatePrivacy(
      parseInt(id),
      updatePrivacyDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Privacy policy updated successfully',
      data: privacy,
    };
  }

  @Delete(':id')
  async deletePrivacy(@Param('id') id: string) {
    await this.privacyService.deletePrivacy(parseInt(id));
    return {
      statusCode: HttpStatus.OK,
      message: 'Privacy policy deleted successfully',
      data: null,
    };
  }
}
