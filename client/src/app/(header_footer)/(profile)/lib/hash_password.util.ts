import bcrypt from 'bcryptjs'

const SALT_ROUNDS: number = 10

const hashPassword = async (plaintext: string) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS)
  return await bcrypt.hash(plaintext, salt)
}

export default hashPassword