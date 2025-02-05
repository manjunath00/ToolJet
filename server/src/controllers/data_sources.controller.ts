import { Controller, ForbiddenException, Body, Get, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../src/modules/auth/jwt-auth.guard';
import { decamelizeKeys } from 'humps';
import { DataSourcesService } from '../../src/services/data_sources.service';
import { AppsService } from '@services/apps.service';
import { AppsAbilityFactory } from 'src/modules/casl/abilities/apps-ability.factory';
import { DataQueriesService } from '@services/data_queries.service';
import {
  AuthorizeDataSourceOauthDto,
  CreateDataSourceDto,
  GetDataSourceOauthUrlDto,
  TestDataSourceDto,
  UpdateDataSourceDto,
} from '@dto/data-source.dto';

@Controller('data_sources')
export class DataSourcesController {
  constructor(
    private appsService: AppsService,
    private appsAbilityFactory: AppsAbilityFactory,
    private dataSourcesService: DataSourcesService,
    private dataQueriesService: DataQueriesService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async index(@Request() req, @Query() query) {
    const app = await this.appsService.find(query.app_id);
    const ability = await this.appsAbilityFactory.appsActions(req.user, {
      id: app.id,
    });

    if (!ability.can('getDataSources', app)) {
      throw new ForbiddenException('you do not have permissions to perform this action');
    }

    const dataSources = await this.dataSourcesService.all(req.user, query);
    const response = decamelizeKeys({ data_sources: dataSources });

    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createDataSourceDto: CreateDataSourceDto) {
    const { kind, name, options, app_id, app_version_id } = createDataSourceDto;
    const appId = app_id;
    const appVersionId = app_version_id;

    const app = await this.appsService.find(appId);
    const ability = await this.appsAbilityFactory.appsActions(req.user, {
      id: appId,
    });

    if (!ability.can('createDataSource', app)) {
      throw new ForbiddenException('you do not have permissions to perform this action');
    }

    const dataSource = await this.dataSourcesService.create(name, kind, options, appId, appVersionId);
    return decamelizeKeys(dataSource);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Request() req, @Param() params, @Body() updateDataSourceDto: UpdateDataSourceDto) {
    const dataSourceId = params.id;
    const { name, options } = updateDataSourceDto;

    const dataSource = await this.dataSourcesService.findOne(dataSourceId);

    const app = await this.appsService.find(dataSource.appId);
    const ability = await this.appsAbilityFactory.appsActions(req.user, {
      id: app.id,
    });

    if (!ability.can('updateDataSource', app)) {
      throw new ForbiddenException('you do not have permissions to perform this action');
    }

    const result = await this.dataSourcesService.update(dataSourceId, name, options);
    return decamelizeKeys(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('test_connection')
  async testConnection(@Request() req, @Body() testDataSourceDto: TestDataSourceDto) {
    const { kind, options } = req.body;
    return await this.dataSourcesService.testConnection(kind, options);
  }

  @UseGuards(JwtAuthGuard)
  @Post('fetch_oauth2_base_url')
  async getAuthUrl(@Request() req, @Body() getDataSourceOauthUrlDto: GetDataSourceOauthUrlDto) {
    const { provider } = getDataSourceOauthUrlDto;
    return await this.dataSourcesService.getAuthUrl(provider);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/authorize_oauth2')
  async authorizeOauth2(
    @Request() req,
    @Param() params,
    @Body() authorizeDataSourceOauthDto: AuthorizeDataSourceOauthDto
  ) {
    const dataSourceId = params.id;
    const { code } = authorizeDataSourceOauthDto;

    const dataSource = await this.dataSourcesService.findOne(dataSourceId);

    const app = await this.appsService.find(dataSource.appId);
    const ability = await this.appsAbilityFactory.appsActions(req.user, {
      id: app.id,
    });

    if (!ability.can('authorizeOauthForSource', app)) {
      throw new ForbiddenException('you do not have permissions to perform this action');
    }

    return await this.dataQueriesService.authorizeOauth2(dataSource, code);
  }
}
