import { EuiCard, EuiFlexGroup, EuiFlexItem, EuiIcon } from '@elastic/eui';
import { FunctionComponent } from 'react';
import KibanaLayout from '../layouts/kibana';

const Index: FunctionComponent = () => {
  return (
    <>
      <KibanaLayout pageHeader={{}}>
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
