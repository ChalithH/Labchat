/*

    HIDDEN_PERMISSION           permissionLevel required to set and see a hidden post
    STICKY_PERMISSION           permissionLevel required to set a post to sticky
    FORCE_COMMENT_PERMISSION    permissionLevel required to post comments regardless of post state
    SEE_HIDDEN_PERMISSION       permissionLevel required to see posts that are hidden
    MODIFY_ALL_POSTS_REPLIES    permissionLevel required to edit and delete all posts/replies
    
 */

    // 60 is the permissionLevel of a Lab Manager
export const PermissionConfig = {
    HIDDEN_PERMISSION: 60,
    STICKY_PERMISSION: 60,
    FORCE_COMMENT_PERMISSION: 60,
    SEE_HIDDEN_PERMISSION: 60,
    MODIFY_ALL_POSTS_REPLIES: 60
}