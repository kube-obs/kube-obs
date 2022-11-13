# Kube-obs

# Run locally in kind

Prerequiste:
* docker
* helm
* kubectl
  
## Execute

```bash
./local.sh
```

api server is exposed as a kubernetes service

```bash
kubectl port-forward svc/api-service 9090:9090
curl -S -X POST -H "Content-Type: application/json" -d @input.json http://localhost:9090/pods -v
```

```json
# input.json
{
  "resource_id": "kube-saver-operator-54fb94b788-2c8dw",
  "cluster": "prod",
  "resource_type": "Pod",
  "namespace_name": "test",
  "pod_status": "Pending",
  "alerted_on": "2007-04-05T14:30:30",
 "pod_event": {}
}

```

