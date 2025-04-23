# Hedgehog Lab Docker Compose Demo

### Candidate
- Name: Liam Robson
- Email: 90liam@gmail.com
- Phone: +44 7588 522277
- LinkedIn: https://www.linkedin.com/in/liam-robson-a1990/

### Cloud Migration Proposal

I have to be honest, I had to research this top quite a bit last night to figure out what I feel is the best solution for this project, switching from an AWS context to Azure took a bit time.  My solution is based of AKS since coming from a Kubernetes background.  We could also use Azure Container Apps for a serverless approach.  I've assumed the following resources are managed by Terraform state and are readilly avilable: -

- AKS cluster with ACR integration from first being built.
- A public IP available for our endpoint
- Application LoadBalancer to handle ingress/egress toward our cluster

As always, there are many ways to deploy our docker app into Azure, here's my approach: -

1. Now that we've a working application we can now build the images for our services.  For this, we'll need a registry of sorts, and we've  couple of options: -

   1.1. We could user dockerhub, which is fine but if we wanted fine grain on what images we want to deploy, let's say using OPA gatekeeper in Kubernetes, this isn't optimal.

   1.2. We could host our own docker registry in our infra (_what we do at Nomad_), another solution I've used, this will require a dedicated host.  Downside is that we need to manage the host, expand disk etc when space is required.

   1.3. Finally, we could use a cloud native registry, like Azure Container Registry.  Since we're deploying into Azure, this option makes the most sense.  The only negative to this is the cost, even though its around 50p p/d for `100Gi`, it's still a cost consideration ~ More [here](https://azure.microsoft.com/en-us/pricing/details/container-registry/)

2. Since we're super wealhty, lets run with ACR for this migration. First we need to login to Azure using our IAM user: -

```bash
az login
```

3. Now, we build the images into our exisintg ACR, for example: -

```bash
docker tag hedgehoglab_frontend hedgehoglab.azurecr.io/hedgehoglabs-demo/frontend:latest
docker tag hedgehoglab_backend hedgehoglab.azurecr.io/hedgehoglabs-demo/backend:latest
```

3. We now need the Kubernetes manifests that consume our new images as well as expose a service to which we can connect to.  The frontend and backend are straight-froward as they don't need any secrets or PV/PVCs.
4. For our Postgres deployment, we're going to need a volume (_do not use hostPath for this_) to persist our data.  We'll also need  a secret, which is mounted inside the pod thatr exposes our database crednetials.  We could also integrate Azure Key Vault into our AKS cluster which would be best practice but with having not much experience with this, K8S secrets will do.
5. Deploy the manifests into the cluster.  We need to manage ingress so we're able to hit https://please-hire-liam.hedgehoglab.com and for this, we'll use Trefik IngressRoutes and MetalLB for our cluster load balancer.

I 'think' this should enable us to build, deploy and service our application to the public.  As with anyting cloud native, it's key that we follow the Azure well-architected framework to inform our design descisions.  Building AKS and its components should follow this method also.