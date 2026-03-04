import { Redirect } from 'expo-router';

export default function Index() {
    // Directly point to the chat flow
    return <Redirect href="/chat" />;
}
