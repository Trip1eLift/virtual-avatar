Note for React.lazy

lazy docs: https://stackoverflow.com/questions/61439315/how-to-import-multiple-components-as-a-single-component-and-use-them-in-lazy-loa

for default
```
const LazyComp = React.lazy(() => import('./LazyComp'))
```

for non default
```
const LazyComp2 = React.lazy(() => import('./LazyComp').then(module => ({default: module.LazyComp2})))
```

to display
```
<React.Suspense fallback={<div>Loading dialog box...</div>}>
    <LazyComp/>
</React.Suspense>
```