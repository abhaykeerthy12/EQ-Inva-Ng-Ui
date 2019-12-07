export interface UserModel {
    CurrentUserId?: string,
    Id?: string;
    Name?: string;
    Department?: string;
    Email?: string;
    Password?: string;
    ConfirmPassword?: string;
    ChangePwd?: boolean;
    IsActive?: boolean
}
