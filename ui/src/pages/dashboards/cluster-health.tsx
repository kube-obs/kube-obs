import dynamic from 'next/dynamic';
import { FunctionComponent } from 'react';
const KibanaLayout = dynamic(() => import('../../layouts/kibana'), {
  ssr: false,
});

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
