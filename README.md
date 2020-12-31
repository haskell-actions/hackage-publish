# hackage-publish
A GitHub action for publishing packages and documentation to Hackage

## Usage Examples

This step publishes packages and documentation as candidates on Hackage using the specified authentication token.  You can generate an authentication token on [your Hackage account managment page](http://hackage.haskell.org/users/account-management).

```yaml
- uses: haskell-actions/hackage-publish@v1
  with:
    hackageToken: ${{ secrets.HACKAGE_AUTH_TOKEN }}
    packagesPath: ${{ runner.temp }}/packages
    docsPath: ${{ runner.temp }}/docs
    publish: false
```

`docsPath` parameter is optional and the action will not try uploading documentation when it is not specified.
When `docsPath` is specified, but doesn't contain documentation for one or many packages in `packagePath`, 
these packages are uploaded without documentation. Missing documentation never results into an execution error.
    
To publish to a custom/private Hackage, specify `hackageServer` parameter to the custom/private Hackage server URI
    
```yaml
- uses: haskell-actions/hackage-publish@v1
  with:
    hackageServer: ${{ secrets.HACKAGE_SERVER }}
    hackageToken: ${{ secrets.HACKAGE_AUTH_TOKEN }}
    packagesPath: ${{ runner.temp }}/packages
    publish: true
```
