import { Page, Text, TextStyle } from '@shopify/polaris'
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <Page
      title="Home"
    >
      <Text as='p' variant='bodyMd'>This is a test. With a change! Again</Text>
    </Page>
  )
}

// export async function getServerSideProps(context: GetServerSidePropsContext) {

//   /**
//    * We need to get a couple things ready before the page loads
//    * 1. Get the shop, host and session from the query string
//    * 2. Get the API key from the environment
//    * 3. Check to see if the app needs to be authorized
//    * 4. If the app needs to be authorized, redirect to the OAuth page
//    * 5. If the app is authorized, check to see if there is a subscription
//    */

//   const { shop, host, session } = context.query;
//   const apiKey = process.env.SHOPIFY_API_KEY;

//   return {
//     props: {
//       shop,
//       host,
//       session,
//     }
//   }
// }
