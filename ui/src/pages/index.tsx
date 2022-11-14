import { FunctionComponent } from 'react';
import Head from 'next/head';
import {
  EuiCard,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiSpacer,
} from '@elastic/eui';
import HomeHero from '../components/starter/home_hero';
import Wrapper from '../components/starter/wrapper';
import HomeTemplates from '../components/starter/home_templates';
import HomeWhy from '../components/starter/home_why';
import KibanaLayout from '../layouts/kibana';

const Index: FunctionComponent = () => {
  return (
    <>
      <KibanaLayout
        template="empty"
        pageHeader={{
          pageTitle: 'Welcome',
        }}>
        <EuiFlexGroup gutterSize="l">
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="discoverApp" />}
              title="Discover"
              description="Example of a card's description. Stick to one or two sentences."
            />
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="dashboardApp" />}
              title="Dashboards"
              description="Example of a card's description. Stick to one or two sentences."
            />
          </EuiFlexItem>

          <EuiFlexItem>
            <EuiCard
              icon={<EuiIcon size="xxl" type="gisApp" />}
              title="Maps"
              description="Example of a card's description. Stick to one or two sentences."
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </KibanaLayout>
    </>
  );
};

export default Index;
