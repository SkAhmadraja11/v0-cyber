import { RealPhishingDetector } from './lib/real-detection';

async function test() {
    console.log('Starting detection test for MSN...');
    const detector = new RealPhishingDetector();
    const url = 'https://www.msn.com/en-in?ocid=wispr&pc=u477&AR=1';

    try {
        const result = await detector.detect(url, 'url');
        console.log('Detection complete!');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error during detection:', error);
    }
}

test().catch(console.error);
