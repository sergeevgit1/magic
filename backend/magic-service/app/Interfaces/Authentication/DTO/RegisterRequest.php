<?php

declare(strict_types=1);
/**
 * Copyright (c) The Magic , Distributed under the software license
 */

namespace App\Interfaces\Authentication\DTO;

class RegisterRequest
{
    protected string $email = '';
    protected string $password = '';
    protected string $organizationCode = '';

    public function getEmail(): string { return $this->email; }
    public function setEmail(string $email): void { $this->email = trim($email); }
    public function getPassword(): string { return $this->password; }
    public function setPassword(string $password): void { $this->password = $password; }
    public function getOrganizationCode(): string { return $this->organizationCode; }
    public function setOrganizationCode(string $organizationCode): void { $this->organizationCode = trim($organizationCode); }
}
