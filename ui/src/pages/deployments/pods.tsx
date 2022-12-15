import {
  AreaSeries,
  Axis,
  Chart,
  DARK_THEME,
  LIGHT_THEME,
  niceTimeFormatByDay,
  ScaleType,
  Settings,
  timeFormatter,
} from '@elastic/charts';
import {
  dateFormatAliases,
  EuiBadge,
  EuiButtonGroup,
  EuiCard,
  EuiCodeBlock,
  EuiCollapsibleNavGroup,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLoadingContent,
  EuiPanel,
  EuiStat,
  EuiText,
  EuiToast,
  formatDate,
} from '@elastic/eui';
import { useTheme } from '@emotion/react';
import * as R from 'ramda';
import React, { FunctionComponent } from 'react';

import dynamic from 'next/dynamic';
import { withElasticQuery } from '../../lib/hooks';
import { useRecoilState } from 'recoil';
import { clusterState } from '../../recoil/cluster';
import { useQuery } from '@tanstack/react-query';
import error from 'next/error';

const KibanaLayout = dynamic(() => import('../../layouts/kibana'), {
  ssr: false,
});

const BadReasons = ['Unhealthy', 'BackOff', 'Failed', 'FailedMount'];
const NeutralReasons = ['Pulling', 'Pulled', 'Scheduled', 'Created'];
const GoodReasons = ['Started'];

const getTitleColor = (reason: string) => {
  if (BadReasons.includes(reason)) {
    return 'danger';
  } else if (NeutralReasons.includes(reason)) {
    return 'primary';
  } else if (GoodReasons.includes(reason)) {
    return 'success';
  }
  return 'default';
};

const PodDetailPane = ({ pod }: { pod: any }) => {
  const [mode, setMode] = React.useState('overview');
  const toggleButtons = [
    {
      id: 'overview',
      label: 'Overview',
    },
    {
      id: 'json',
      label: 'JSON',
    },
  ];
  return (
    <React.Fragment>
      <EuiButtonGroup
        legend="This is a basic group"
        options={toggleButtons}
        idSelected={mode}
        onChange={id => setMode(id)}
        buttonSize="compressed"
      />
      <br />
      {mode === 'overview' && (
        <React.Fragment>
          <EuiFlexGroup style={{ padding: '1em' }}>
            <EuiFlexItem>
              <EuiStat
                titleSize="xs"
                title={pod.document.metadata.namespace}
                description="Namespace"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                titleSize="xs"
                title={pod.document.metadata.name}
                description="Name"
                titleColor="subdued"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                titleSize="xs"
                title={pod.document.status.phase}
                description="Phase"
                titleColor="primary"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                titleSize="xs"
                title={pod.document.spec.containers.length}
                description="Containers"
                titleColor="success"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                titleSize="xs"
                title={pod.document.spec.volumes.length}
                description="Volumes"
                titleColor="danger"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                titleSize="xxs"
                title={pod.document.spec.nodeName || pod.document.spec.nodename}
                description="Node"
                titleColor="accent"
              />
            </EuiFlexItem>
            <EuiFlexItem>
              <EuiStat
                titleSize="xs"
                title={pod.document.spec.restartPolicy}
                description="Restart Policy"
              />
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiToast title="Containers" color="primary" iconType="tokenStruct">
            {R.pathOr([], ['document', 'spec', 'containers'], pod).map(
              container => (
                <EuiCard
                  textAlign="left"
                  onClick={() => {}}
                  betaBadgeProps={{
                    label: container.image,
                    tooltipContent:
                      'This module is not GA. Please help us by reporting any bugs.',
                  }}>
                  <EuiFlexGroup>
                    <EuiFlexItem>
                      <EuiStat
                        titleSize="xs"
                        title={container.name}
                        description="Name"
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiStat
                        titleSize="xs"
                        title={container.image}
                        description="Image"
                        titleColor="subdued"
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiStat
                        titleSize="xs"
                        title={container.imagePullPolicy}
                        description="ImagePullPolicy"
                        titleColor="primary"
                      />
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiStat
                        titleSize="xs"
                        title={container.volumeMounts.length || 0}
                        description="Volume Mounts"
                        titleColor="success"
                      />
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiText>
                    <h5>Ports</h5>
                    {R.pathOr([], ['ports'], container).map(port => (
                      <EuiBadge color="success">{`${port.protocol} ${
                        port.containerPort
                      } ${port.name || ''} `}</EuiBadge>
                    ))}
                    {!container.ports && (
                      <EuiBadge color="primary">NONE</EuiBadge>
                    )}

                    <h5>Volume Mounts</h5>
                    {R.pathOr([], ['volumeMounts'], container).map(vm => (
                      <EuiBadge color="success">{`${vm.name} => ${vm.mountPath}`}</EuiBadge>
                    ))}
                    {!container.ports && (
                      <EuiBadge color="primary">NONE</EuiBadge>
                    )}
                  </EuiText>
                </EuiCard>
              )
            )}
          </EuiToast>
          <br />
          <EuiToast title="Volumes" color="primary" iconType="storage">
            {R.pathOr([], ['document', 'spec', 'volumes'], pod).map(vol => (
              <EuiBadge color="success">{vol.name}</EuiBadge>
            ))}
          </EuiToast>
        </React.Fragment>
      )}
      {mode === 'json' && (
        <React.Fragment>
          <EuiCodeBlock language="JSON">
            {JSON.stringify(pod, null, '\t')}
          </EuiCodeBlock>
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

const PodDetail = ({ pod }: { pod: any }) => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['searchDetails', pod.id, isOpen],
    queryFn: async () => {
      const data = await fetch(`/api/document/${pod.id}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      return data.json();
    },
    enabled: !!isOpen,
  });
  return (
    <EuiCollapsibleNavGroup
      title={
        <React.Fragment>
          <EuiBadge color="success">{pod.namespace}</EuiBadge>&nbsp;/&nbsp;
          <EuiBadge color="primary">{pod.name}</EuiBadge>
        </React.Fragment>
      }
      titleSize="xxxs"
      titleElement="span"
      isCollapsible={true}
      onToggle={e => setIsOpen(e)}
      initialIsOpen={false}>
      {isLoading && <EuiLoadingContent lines={5} />}
      {data && !isLoading && !error && (
        <React.Fragment>
          <PodDetailPane pod={R.pathOr({}, ['_source'], data)} />
          {/* <EuiText size="s" color="subdued">
            <EuiCodeBlock language="JSON">
              {JSON.stringify(R.pathOr({}, ['_source'], data), null, '\t')}
            </EuiCodeBlock>
          </EuiText> */}
        </React.Fragment>
      )}
    </EuiCollapsibleNavGroup>
  );
};

const PodDeploymentsPanel = () => {
  const [cluster] = useRecoilState(clusterState);
  const { data, isLoading, error } = useQuery({
    queryKey: ['superSearchResults', cluster],
    queryFn: withElasticQuery(`
    SELECT 
      _document_id as id,
      document.metadata.namespace as namespace,
      document.metadata.name as name
    FROM kubeobs 
    WHERE 
      metadata.cluster = '${cluster}' AND
      metadata.type = 'POD_RESOURCE'
    LIMIT 100
    `),
    enabled: true,
  });

  console.log('>>> pod deployments', data, error, isLoading);

  const podSorting = R.sortWith([
    R.ascend(R.prop('namespace')),
    R.ascend(R.prop('name')),
  ]);

  const sortedData = data ? podSorting(data) : [];

  const pods = sortedData.map(pod => <PodDetail pod={pod} />);
  return pods;
};

const PodResourceStats = () => {
  const [cluster] = useRecoilState(clusterState);
  const { data, isLoading, error } = useQuery({
    queryKey: ['getPodResourceStats', cluster],
    queryFn: withElasticQuery(`
    SELECT 
      document.status.phase, 
      count(*) AS count 
    FROM kubeobs 
    WHERE metadata.cluster = '${cluster}'
    AND metadata.type = 'POD_RESOURCE'
    GROUP BY metadata.cluster, document.status.phase
    ORDER BY document.status.phase
    `),
    enabled: !!cluster,
  });

  console.log('>>>> debug', data, '>>> err', error, isLoading);

  const statItems = (data || []).map(row => (
    <EuiFlexItem>
      <EuiStat
        title={row.count}
        description={row['document.status.phase']}
        textAlign="right"
        titleColor={getTitleColor(row['document.status.phase'])}
        isLoading={isLoading}></EuiStat>
    </EuiFlexItem>
  ));

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      }}>
      {statItems}
    </div>
  );
};

const Index: FunctionComponent = () => {
  const { colorMode } = useTheme();

  const [cluster] = useRecoilState(clusterState);

  return (
    <>
      <KibanaLayout
        pageHeader={{
          pageTitle: 'Pod Deployments',
        }}>
        <EuiPanel paddingSize="l">
          <EuiText>
            <h3>Pod resources</h3>
            <PodResourceStats />
            <h3>Pod deployments</h3>
            <PodDeploymentsPanel />
          </EuiText>
        </EuiPanel>
      </KibanaLayout>
    </>
  );
};

export default Index;
