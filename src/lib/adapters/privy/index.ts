import { PRIVY_APP_ID, PRIVY_APP_SECRET } from '@/lib/constants';
import { PrivyClient } from '@privy-io/server-auth';

export default new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET);
