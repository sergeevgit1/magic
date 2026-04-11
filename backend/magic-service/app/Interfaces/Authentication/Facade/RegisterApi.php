<?php

declare(strict_types=1);
/**
 * Copyright (c) The Magic , Distributed under the software license
 */

namespace App\Interfaces\Authentication\Facade;

use App\Application\Authentication\Service\RegisterAppService;
use App\Interfaces\Authentication\DTO\RegisterRequest;
use Hyperf\HttpServer\Contract\RequestInterface;

class RegisterApi
{
    public function __construct(protected RegisterAppService $registerAppService) {}

    public function register(RequestInterface $request): array
    {
        $registerRequest = new RegisterRequest();
        $registerRequest->setEmail((string) $request->input('email', ''));
        $registerRequest->setPassword((string) $request->input('password', ''));
        $registerRequest->setOrganizationCode((string) $request->input('organization_code', ''));
        return $this->registerAppService->register($registerRequest);
    }
}
