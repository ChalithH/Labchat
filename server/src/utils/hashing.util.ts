import bcrypt from 'bcrypt'


const SALT_ROUNDS: number = 10

export const hashPassword = async (plaintext: string) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS)
    return await bcrypt.hash(plaintext, salt)
}

export const comparePasswords = async (plaintext: string, ciphertext: string) => {
    return await bcrypt.compare(plaintext, ciphertext)
}