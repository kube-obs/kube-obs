import {
  EuiPageContentHeaderProps,
  EuiPageTemplate,
  EuiPageTemplateProps,
} from '@elastic/eui';
import { FunctionComponent } from 'react';
import { kibanaLayoutStyles } from './kibana.styles';
import CollapsibleNav from './kibana_collapsible_nav';

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
  );
};

export default KibanaLayout;
