import { genRequestUrl } from "@/utils/http"

import type { Common } from "@/types/common"
import { env } from "@/utils/env"
import type { HttpClient } from "@/apis/core/HttpClient"

export const generateCommonApi = (fetch: HttpClient) => ({
/**
 * 获取应用国际化语言、国际冠号等配置(开源版本本地获取)
 * @returns
 */
async getInternationalizedSettings() {
return {
phone_area_codes: [
{
code: "+7",
name: "Россия",
locale: "ru_RU",
translations: {
zh_CN: "俄罗斯",
en_US: "Russia",
ru_RU: "Россия",
},
},
{
code: "+1",
name: "United States",
locale: "en_US",
translations: {
zh_CN: "美国",
en_US: "United States",
ru_RU: "США",
},
},
{
code: "+86",
name: "中国",
locale: "zh_CN",
translations: {
zh_CN: "中国",
en_US: "China",
ru_RU: "Китай",
},
},
{
code: "+60",
name: "Malaysia",
locale: "ms_MY",
translations: {
zh_CN: "马来西亚",
en_US: "Malaysia",
ru_RU: "Малайзия",
},
},
{
code: "+84",
name: "Vietnam",
locale: "vi_VN",
translations: {
zh_CN: "越南",
en_US: "Vietnam",
ru_RU: "Вьетнам",
},
},
{
code: "+66",
name: "Thailand",
locale: "th_TH",
translations: {
zh_CN: "泰国",
en_US: "Thailand",
ru_RU: "Таиланд",
},
},
{
code: "+63",
name: "Philippines",
locale: "fil_PH",
translations: {
zh_CN: "菲律宾",
en_US: "Philippines",
ru_RU: "Филиппины",
},
},
{
code: "+65",
name: "Singapore",
locale: "en_SG",
translations: {
zh_CN: "新加坡",
en_US: "Singapore",
ru_RU: "Сингапур",
},
},
],
languages: [
{
name: "简体中文",
locale: "zh_CN",
translations: {
zh_CN: "简体中文",
en_US: "Simplified Chinese",
ru_RU: "Китайский",
},
},
{
name: "英文",
locale: "en_US",
translations: {
zh_CN: "英文",
en_US: "English",
ru_RU: "Английский",
},
},
{
name: "Русский",
locale: "ru_RU",
translations: {
zh_CN: "俄文",
en_US: "Russian",
ru_RU: "Русский",
},
},
],
}
},

/**
 * @description 获取私有化登录环境配置
 * @param {string} code 私有化部署授权码
 */
async getPrivateConfigure(code: string): Promise<{ config: Common.PrivateConfig }> {
if (!code || code === "") {
return {
config: {
deployCode: "",
services: {
keewoodAPI: {
url: env("MAGIC_SERVICE_KEEWOOD_BASE_URL", true) as string,
},
teamshareAPI: {
url: env("MAGIC_TEAMSHARE_WEB_URL", true) as string,
},
teamshareWeb: {
url: env("MAGIC_SERVICE_TEAMSHARE_BASE_URL", true) as string,
},
keewoodWeb: {
url: env("MAGIC_KEEWOOD_WEB_URL", true) as string,
},
magicAPI: {
url: env("MAGIC_SERVICE_BASE_URL", true) as string,
},
magicWeb: {
url: env("MAGIC_WEB_URL", true) as string,
},
},
}
}
}

return fetch.get(genRequestUrl("/api/v1/auth/deploy-config", {}, { code }))
},
})
