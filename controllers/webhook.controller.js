import { Webhook } from 'svix'
import userModel from '../models/user.model.js'
import postModel from '../models/post.model.js'

export const clerkWebHook = async (req, res) => {
  const secret = process.env.CLERK_WEBHOOK_SECRET

  if (!secret) {
    throw new Error('Webhook secret needed!!')
  }

  const payload = req.body
  const headers = req.headers

  const wh = new Webhook(secret)
  let evt
  try {
    evt = wh.verify(payload, headers)
  } catch (err) {
    res.status(400).json({
      message: 'Webhook verification failed',
    })
  }

  // console.log(evt.data);

  if (evt.type === 'user.created') {
    const newUser = new userModel({
      clerkUserId: evt.data.id,
      username: evt.data.username || evt.data.email_addresses[0].email_address,
      email: evt.data.email_addresses[0].email_address,
      profile_img: evt.data.profile_image_url,
    })

    await newUser.save()
  }

  if (evt.type === 'user.deleted') {
    const deletedUser = await userModel.findOneAndDelete({
      clerkUserId: evt.data.id,
    })

    await postModel.deleteMany({ user: deletedUser._id })
    // await Comment.deleteMany({ user: deletedUser._id })
  }

  return res.status(200).json({
    message: 'Webhook received',
  })
}
