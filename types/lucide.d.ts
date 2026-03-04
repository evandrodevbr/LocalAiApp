import 'lucide-react-native';

declare module 'lucide-react-native' {
    interface LucideProps {
        color?: string;
        stroke?: string;
        fill?: string;
        size?: number | string;
        absoluteStrokeWidth?: boolean;
        'data-testid'?: string;
        style?: any;
    }
}
