import { EuiSelect } from '@elastic/eui';
import React from 'react';

const ClusterSelector = () => {
  const options = [
    { value: 'option_one', text: 'Option one' },
    { value: 'option_two', text: 'Option two' },
    { value: 'option_three', text: 'Option three' },
  ];
  return (
    <EuiSelect
      id="clusterSelector"
      compressed
      prepend={'Cluster'}
      options={options}
      // value={value}
      // onChange={e => onChange(e)}
      aria-label="Use aria labels when no actual label is in use"
    />
  );
};

export { ClusterSelector };
