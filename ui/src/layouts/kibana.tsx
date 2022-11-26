import { FunctionComponent } from 'react';
import CollapsibleNav from './kibana_collapsible_nav';
import { kibanaLayoutStyles } from './kibana.styles';
import {
  EuiPageTemplate,
  EuiPageTemplateProps,
  EuiPageContentHeaderProps,
} from '@elastic/eui';
import { RecoilURLSyncJSON } from 'recoil-sync';

interface KibanaLayoutProps extends EuiPageTemplateProps {
  pageHeader: EuiPageContentHeaderProps;
}

const KibanaLayout: FunctionComponent<KibanaLayoutProps> = ({
  children,
  pageHeader,
  ...rest
}) => {
  const styles = kibanaLayoutStyles();
  return (
    <RecoilURLSyncJSON location={{ part: 'queryParams' }}>
      <div css={styles.mainWrapper}>
        <CollapsibleNav />

        <div css={styles.contentWrapper}>
          <EuiPageTemplate
            restrictWidth
            panelled={false}
            bottomBorder={true}
            {...rest}>
            <EuiPageTemplate.Header {...pageHeader} />
            <EuiPageTemplate.Section>{children}</EuiPageTemplate.Section>
          </EuiPageTemplate>
        </div>
      </div>
    </RecoilURLSyncJSON>
  );
};

export default KibanaLayout;
