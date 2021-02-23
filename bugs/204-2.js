import test from 'ava';
import sut from './server';
import request from 'supertest-as-promised';
import mongoose from 'mongoose';
import mockgoose from 'mockgoose';

test.before(async t => {
    console.log('1');
    await mockgoose(mongoose);
    console.log('2');
    const Subscription = mongoose.model('Subscription');
    await Subscription.create({ id: 'found' })
});

test('send message to an existent subscription', async t => {
    const res = await request(sut).post('/api/found/message');
    t.is(res.status, 200);
});

test.after(t => mockgoose.reset(err => {
  if (err) t.fail(err)
}));
