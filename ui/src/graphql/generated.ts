export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  JSONObject: any;
};

export type AddEventInput = {
  event: Scalars['JSONObject'];
  type: EventType;
};

export type AddResourceInput = {
  resource: Scalars['JSONObject'];
  type: ResourceType;
};

export enum EventType {
  Deployment = 'DEPLOYMENT',
  Pod = 'POD',
  StatefulSet = 'STATEFUL_SET'
}

export type Mutation = {
  __typename?: 'Mutation';
  addEvent: Scalars['JSONObject'];
  addResource: Scalars['JSONObject'];
};


export type MutationAddEventArgs = {
  input: AddEventInput;
};


export type MutationAddResourceArgs = {
  input: AddResourceInput;
};

export type Query = {
  __typename?: 'Query';
  foo?: Maybe<Scalars['JSONObject']>;
  time?: Maybe<Scalars['DateTime']>;
};

export enum ResourceType {
  Deployment = 'DEPLOYMENT',
  Pod = 'POD',
  StatefulSet = 'STATEFUL_SET'
}
