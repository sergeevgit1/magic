import { describe, it, expect } from "vitest"
import { encryptPhoneWithCountryCode, validatePhone } from "../phone"

describe("encryptPhone", () => {
it("should return the original phone number if it is invalid", () => {
expect(encryptPhoneWithCountryCode("123", "+1")).toBe("123")
expect(encryptPhoneWithCountryCode("abcdefghijk", "+1")).toBe("abcdefghijk")
})

it("should encrypt a valid Chinese mainland phone number", () => {
expect(encryptPhoneWithCountryCode("13800138000", "+86")).toBe("+86 138****8000")
})

it("should encrypt a valid non-Chinese phone number", () => {
expect(encryptPhoneWithCountryCode("9123456789", "+7")).toBe("+7 91*****89")
})

it("should use custom symbol for encryption", () => {
expect(encryptPhoneWithCountryCode("13800138000", "+86", "#")).toBe("+86 138####8000")
})
})

describe("validatePhone", () => {
it("should return true for valid phone numbers from multiple regions", () => {
expect(validatePhone("13800138000", "+86")).toBe(true)
expect(validatePhone("9123456789", "+7")).toBe(true)
})

it("should return false for invalid phone numbers", () => {
expect(validatePhone("123", "+86")).toBe(false)
expect(validatePhone("abcdefghijk", "+86")).toBe(false)
expect(validatePhone("9123456789", "")).toBe(false)
})
})
