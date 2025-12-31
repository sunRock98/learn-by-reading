import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();
// {
// experimental: {
//   createMessagesDeclaration: './messages/en.json'
// }
//   }

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
