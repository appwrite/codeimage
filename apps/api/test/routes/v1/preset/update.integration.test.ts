import {Preset, User} from '@codeimage/prisma-models';
import {FastifyError} from 'fastify';
import * as sinon from 'sinon';
import {afterEach, assert, beforeEach, test} from 'vitest';
import {PresetDto} from '../../../../src/modules/preset/schema/preset-dto.schema.js';
import {PresetUpdateDto} from '../../../../src/modules/preset/schema/preset-update-dto.schema.js';
import {testPresetUtils} from '../../../__internal__/presetUtils.js';
import {build} from '../../../helper.js';
import {presetSeed, userSeed} from '../../../helpers/seed.js';

interface TestContext {
  user: User;
  preset1: Preset;
}

beforeEach(() => sinon.restore());

beforeEach<TestContext>(async context => {
  const user = await userSeed.createUser();
  const preset1 = await presetSeed.createPresetV1('preset-1', user.id);
  context.user = user;
  context.preset1 = preset1;
});

afterEach(async () => {
  await Promise.all([userSeed.clean(), presetSeed.clean()]);
});

test<TestContext>('[PUT] /v1/preset/:id -> 200', async context => {
  const fastify = await build(context);
  const presetId = context.preset1.id;
  const spy = sinon.spy(fastify.presetService, 'updatePreset');

  const request: PresetUpdateDto = {
    data: testPresetUtils.buildPresetData(),
    name: 'updated',
  };

  const response = await fastify.inject({
    url: `/api/v1/preset/${presetId}`,
    method: 'PUT',
    payload: request,
  });

  const body = response.json<PresetDto>();

  assert.ok(spy.withArgs(context.user.id, presetId, request).calledOnce);
  assert.equal(response.statusCode, 200);
  assert.equal(body.name, 'updated');
});

test<TestContext>('[PUT] /v1/preset/:id -> when preset not found -> 404', async context => {
  const fastify = await build(context);
  const userId = context.user.id;
  const presetId = 'badId';
  const spy = sinon.spy(fastify.presetService, 'updatePreset');

  const request: PresetUpdateDto = {
    name: 'updated',
    data: {test: 'updated'},
  };

  const response = await fastify.inject({
    url: `/api/v1/preset/${presetId}`,
    method: 'PUT',
    payload: request,
  });

  const body = response.json<FastifyError>();

  assert.ok(spy.withArgs(context.user.id, presetId, request).calledOnce);
  assert.equal(response.statusCode, 404);
  assert.equal(body.code, 'NotFoundPresetException');
  assert.equal(
    body.message,
    `Preset with id ${presetId} for user ${userId} not found`,
  );
});
