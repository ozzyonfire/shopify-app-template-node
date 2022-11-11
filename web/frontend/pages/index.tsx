import { Card, Page, Text } from '@shopify/polaris'
import { GetServerSidePropsContext } from 'next';
import { useState } from 'react';
import { useFetcher } from '../providers/APIProvider';

interface Data {
  name: string;
  height: string;
}

export default function Home() {
  const fetcher = useFetcher();
  const [data, setData] = useState<Data | null>(null);

  const handleGetAPIRequest = async () => {
    const data = await fetcher<Data>('/api/hello');
    setData(data);
  }

  return (
    <Page
      title="Home"
    >
      <Card
        sectioned
        title="API Call to the Express JS Server"
        primaryFooterAction={{
          content: 'Call API',
          onAction: handleGetAPIRequest,
        }}
      >
        <Text as='p' variant='bodyMd'>Call the express server from within your app. The request is verified use session tokens.</Text>
        {data && (
          <Text as="h1" variant="headingSm">
            {data.name} is {data.height} tall.
          </Text>
        )}
      </Card>
    </Page>
  )
}

//   /**
//    * We need to get a couple things ready before the page loads
//    * 1. Get the shop, host and session from the query string
//    * 2. Get the API key from the environment
//    * 3. Check to see if the app needs to be authorized
//    * 4. If the app needs to be authorized, redirect to the OAuth page
//    * 5. If the app is authorized, check to see if there is a subscription
//    */
// export async function getServerSideProps(context: GetServerSidePropsContext) {
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
