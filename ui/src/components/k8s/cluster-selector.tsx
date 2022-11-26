import { EuiSelect } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { withElasticQuery } from '../../lib/hooks';
import { clusterState } from '../../recoil/cluster';

const ClusterSelector = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clusterList'],
    queryFn: withElasticQuery('SELECT cluster FROM kubeobs GROUP BY cluster'),
  });

  const [cluster, setCluster] = useRecoilState(clusterState);

  useEffect(() => {
    if (!cluster && data && data.length > 0) {
      setCluster(data[0].cluster);
    }
  }, [cluster, data]);

  const options =
    (data &&
      data.map(item => ({
        value: item.cluster,
        text: item.cluster,
      }))) ||
    [];

  return (
    <EuiSelect
      id="clusterSelector"
      compressed
      disabled={isLoading}
      prepend={'Cluster'}
      options={options}
      value={cluster}
      onChange={e => {
        setCluster(e.target.value);
      }}
      aria-label="Use aria labels when no actual label is in use"
    />
  );
};

export { ClusterSelector };
