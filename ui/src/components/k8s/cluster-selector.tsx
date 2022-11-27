import { EuiSelect } from '@elastic/eui';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { withElasticQuery } from '../../lib/hooks';
import { clusterState } from '../../recoil/cluster';
import * as R from "ramda";

const ClusterSelector = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['clusterList'],
    queryFn: withElasticQuery(
      'SELECT metadata.cluster FROM kubeobs GROUP BY metadata.cluster'
    ),
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
        value: R.prop("metadata.cluster", item),
        text: R.prop("metadata.cluster", item),
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
