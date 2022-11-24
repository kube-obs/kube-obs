import { EuiPanel, EuiCode, EuiText } from '@elastic/eui';
import { FunctionComponent } from 'react';
import KibanaLayout from '../../layouts/kibana';

const Index: FunctionComponent = () => {
  return (
    <>
      <KibanaLayout
        pageHeader={{
          pageTitle: 'Pods',
        }}>
        <EuiPanel paddingSize="l">
          <EuiText>
            <h3>Pod events</h3>
          </EuiText>
        </EuiPanel>
      </KibanaLayout>
    </>
  );
};

export default Index;
