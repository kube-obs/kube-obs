#!/bin/sh
set -o errexit
# delete if cluster already exists
kind delete cluster
# create registry container unless it already exists
reg_name='kind-registry'
reg_port='5001'
if [ "$(docker inspect -f '{{.State.Running}}' "${reg_name}" 2>/dev/null || true)" != 'true' ]; then
  docker run \
    -d --restart=always -p "127.0.0.1:${reg_port}:5000" --name "${reg_name}" \
    registry:2
fi

# create a cluster with the local registry enabled in containerd
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
containerdConfigPatches:
- |-
  [plugins."io.containerd.grpc.v1.cri".registry.mirrors."localhost:${reg_port}"]
    endpoint = ["http://${reg_name}:5000"]
EOF

# connect the registry to the cluster network if not already connected
if [ "$(docker inspect -f='{{json .NetworkSettings.Networks.kind}}' "${reg_name}")" = 'null' ]; then
  docker network connect "kind" "${reg_name}"
fi

# Document the local registry
# https://github.com/kubernetes/enhancements/tree/master/keps/sig-cluster-lifecycle/generic/1755-communicating-a-local-registry
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: ConfigMap
metadata:
  name: local-registry-hosting
  namespace: kube-public
data:
  localRegistryHosting.v1: |
    host: "localhost:${reg_port}"
    help: "https://kind.sigs.k8s.io/docs/user/local-registry/"
EOF

helm repo add bitnami https://charts.bitnami.com/bitnami
helm install postgresql-dev bitnami/postgresql --values local/postgres/values.yaml

export DOCKER_BUILDKIT=1

# takes ~10min for build for the first time
docker build . -t localhost:5001/kube-obs-api:0.1 -f docker/api.Dockerfile
docker push localhost:5001/kube-obs-api:0.1
docker build . -t localhost:5001/kube-obs-init:0.1 -f docker/initContainer.Dockerfile
docker push localhost:5001/kube-obs-init:0.1
# takes ~10min for build for the first time
docker build . -t localhost:5001/kube-obs-controller:0.1 -f docker/controller.Dockerfile
docker push localhost:5001/kube-obs-controller:0.1

sleep 30 # for db to come up
kubectl apply -f local/api.yaml -n default
sleep 20 # for api to come up
kubectl apply -f local/controller.yaml
