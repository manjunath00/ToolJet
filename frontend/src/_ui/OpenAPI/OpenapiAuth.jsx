import React from 'react';
import Input from '@/_ui/Input';

const OpenapiAuth = ({ auth_type, username, password, bearer_token, optionchanged, authObject, api_keys }) => {
  const apiKeyChanges = (key, value) => {
    const obj = api_keys ?? {};
    obj[key].value = value;
    optionchanged('api_keys', obj);
  };

  const renderApiKeyField = (auth) => {
    if (auth) {
      const value = api_keys[auth.key]?.value ?? '';
      return (
        <div className="col-md-12">
          <label className="form-label text-muted mt-3">{auth.key}</label>
          <Input
            type="text"
            className="form-control"
            onChange={(e) => apiKeyChanges(auth.key, e.target.value)}
            value={value}
          />
        </div>
      );
    } else return null;
  };

  if (auth_type === 'basic') {
    return (
      <div>
        <div className="col-md-12">
          <label className="form-label text-muted mt-3">Username</label>
          <Input
            type="text"
            className="form-control"
            onChange={(e) => optionchanged('username', e.target.value)}
            value={username}
          />
        </div>
        <div className="col-md-12">
          <label className="form-label text-muted mt-3">Password</label>
          <Input
            type="text"
            className="form-control"
            onChange={(e) => optionchanged('password', e.target.value)}
            value={password}
          />
        </div>
      </div>
    );
  } else if (auth_type === 'bearer') {
    return (
      <div>
        <div className="col-md-12">
          <label className="form-label text-muted mt-3">Token</label>
          <Input
            type="text"
            className="form-control"
            onChange={(e) => optionchanged('bearer_token', e.target.value)}
            value={bearer_token}
          />
        </div>
      </div>
    );
  } else if (auth_type === 'apiKey') {
    if (Array.isArray(authObject)) {
      return (
        <div>
          {authObject.map((auth) => {
            return renderApiKeyField(auth);
          })}
        </div>
      );
    } else {
      return renderApiKeyField(authObject);
    }
  } else {
    return null;
  }
};

export default OpenapiAuth;