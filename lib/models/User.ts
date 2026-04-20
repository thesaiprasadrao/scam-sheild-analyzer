import mongoose, { Schema, type Document } from "mongoose"

export interface IUser extends Document {
  id: string
  email: string
  name?: string
  passwordHash?: string
  image?: string
  profileType?: string
  profileCompleted?: boolean
  preferences?: {
    fontSize?: string
    simplifiedUI?: boolean
    voiceEnabled?: boolean
  }
  createdAt?: string
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: String,
  passwordHash: String,
  image: String,
  profileType: String,
  profileCompleted: { type: Boolean, default: false },
  preferences: {
    fontSize: String,
    simplifiedUI: Boolean,
    voiceEnabled: Boolean,
  },
  createdAt: { type: String, default: () => new Date().toISOString() },
})

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)
