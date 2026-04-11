<?php

declare(strict_types=1);
/**
 * Copyright (c) The Magic , Distributed under the software license
 */

namespace App\Application\Authentication\Service;

use App\Domain\Authentication\Repository\Facade\AuthenticationRepositoryInterface;
use App\Domain\Authentication\Service\PasswordService;
use App\Domain\Contact\Entity\AccountEntity;
use App\Domain\Contact\Entity\MagicUserEntity;
use App\Domain\Contact\Entity\ValueObject\AccountStatus;
use App\Domain\Contact\Entity\ValueObject\UserIdType;
use App\Domain\Contact\Entity\ValueObject\UserStatus;
use App\Domain\Contact\Entity\ValueObject\UserType;
use App\Domain\Contact\Repository\Facade\MagicAccountRepositoryInterface;
use App\Domain\Contact\Repository\Facade\MagicUserRepositoryInterface;
use App\ErrorCode\AuthenticationErrorCode;
use App\Infrastructure\Core\Exception\ExceptionBuilder;
use App\Infrastructure\Util\IdGenerator\IdGenerator;
use App\Interfaces\Authentication\DTO\RegisterRequest;
use Hyperf\DbConnection\Db;

use function Hyperf\Config\config;
use function Hyperf\Support\env;

readonly class RegisterAppService
{
    public function __construct(
        private AuthenticationRepositoryInterface $authenticationRepository,
        private MagicAccountRepositoryInterface $magicAccountRepository,
        private MagicUserRepositoryInterface $magicUserRepository,
        private PasswordService $passwordService,
    ) {}

    public function register(RegisterRequest $request): array
    {
        $email = strtolower(trim($request->getEmail()));
        $password = $request->getPassword();
        $organizationCode = trim($request->getOrganizationCode());
        if ($organizationCode === '') {
            $organizationCode = (string) config('service_provider.office_organization', '');
        }

        if ($email === '' || ! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            ExceptionBuilder::throw(AuthenticationErrorCode::AccountNotFound, 'invalid email');
        }
        if ($password === '') {
            ExceptionBuilder::throw(AuthenticationErrorCode::PasswordError, 'password required');
        }
        if ($organizationCode === '') {
            ExceptionBuilder::throw(AuthenticationErrorCode::UserNotFound, 'organization_code required');
        }
        if ($this->authenticationRepository->findAccountByEmail($email) !== null) {
            ExceptionBuilder::throw(AuthenticationErrorCode::AccountAlreadyExists);
        }

        $magicId = (string) IdGenerator::getSnowId();
        $hashedPassword = $this->passwordService->hashPassword($password);
        $envId = (int) env('MAGIC_ENV_ID', 10000);

        Db::transaction(function () use ($email, $organizationCode, $magicId, $hashedPassword, $envId) {
            $account = new AccountEntity();
            $account->setMagicId($magicId);
            $account->setType(UserType::Human);
            $account->setStatus(AccountStatus::Normal);
            $account->setCountryCode('');
            $account->setPhone('');
            $account->setEmail($email);
            $account->setRealName($email);
            $account->setPassword($hashedPassword);
            $account->setMagicEnvironmentId($envId);
            $this->magicAccountRepository->createAccount($account);

            $user = new MagicUserEntity();
            $user->setMagicId($magicId);
            $user->setOrganizationCode($organizationCode);
            $user->setUserId($this->magicUserRepository->getUserIdByType(UserIdType::UserId, $organizationCode));
            $user->setUserType(UserType::Human);
            $user->setStatus(UserStatus::Activated);
            $user->setNickname($email);
            $user->setAvatarUrl('');
            $user->setDescription('Self-hosted email registration');
            $user->setLikeNum(0);
            $user->setLabel('');
            $user->setI18nName('');
            $this->magicUserRepository->createUser($user);
        });

        return [
            'success' => true,
            'email' => $email,
            'magic_id' => $magicId,
            'organization_code' => $organizationCode,
        ];
    }
}
