import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * 一个严格的认证守卫。
 * 它会验证请求头中的 JWT (Bearer Token)。
 * 如果 Token 不存在或无效，它会自动抛出 401 Unauthorized 错误。
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
