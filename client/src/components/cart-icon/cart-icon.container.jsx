import React from 'react';
import { Query, Mutation, graphql } from 'react-apollo';
import { gql } from 'apollo-boost';
import { flowRight } from 'lodash';

import CartIcon from './cart-icon.component';

const TOGGLE_CART_HIDDEN = gql`
  mutation ToggleCartHidden {
    toggleCartHidden @client
  }
`;

const GET_ITEM_COUNT = gql`
  {
    itemCount @client
  }
`

const CartIconContainer = () => (
  <Query query={GET_ITEM_COUNT}>
    {
      ({ data: { itemCount } }) => (
        <Mutation mutation={TOGGLE_CART_HIDDEN}>
          {
            toggleCartHidden => (
              <CartIcon itemCount={itemCount} toggleCartHidden={toggleCartHidden} />
            )
          }
        </Mutation>
      )
    }
  </Query>
);

export default CartIconContainer;