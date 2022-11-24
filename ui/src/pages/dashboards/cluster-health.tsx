import { FunctionComponent } from 'react';
import KibanaLayout from '../../layouts/kibana';

const Index: FunctionComponent = () => {
  return (
    <>
      <KibanaLayout
        pageHeader={{
          pageTitle: 'Cluster Health',
        }}>
        Cluster Health
      </KibanaLayout>
    </>
  );
};

export default Index;
