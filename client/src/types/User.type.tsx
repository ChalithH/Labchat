
// Based on the prisma user model
export type UserType = {
    roleId: number,
    universityId: string,
    username: string,
    loginEmail: string,
    loginPassword: string,
    firstName: string,
    lastName: string,
    displayName: string,
    jobTitle: string,
    office: string,
    bio: string,
    dateJoined: string
}