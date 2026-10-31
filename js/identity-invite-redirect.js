// Netlify Identity emails link to the site root; preserve the invite/recovery token.
if(/^#(?:invite|recovery|confirmation|email_change)_token=/.test(location.hash)){
 location.replace('/admin/'+location.hash);
}
