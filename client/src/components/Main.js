import React, { Component } from 'react';
import { Header, Container, Menu } from 'semantic-ui-react'
import { socketApp } from '../store';

class Main extends Component {

  state = {}

  componentWillMount() {
    const itemService = socketApp.service('/items');
    itemService.on('created', (item) => this.props.createdItem(item));
    itemService.on('updated', (item) => this.props.updatedItem(item));
    itemService.on('removed', (item) => this.props.removedItem(item));
  }

  onClickMenu = (e, { name }) => {
    console.log('menu clicked!')
    this.setState({ activeItem: name })
  }

  render() {

    const { activeItem } = this.state

    return (
      <Container>

        <Menu>
            <Menu.Item
              name="about"
              active={activeItem === 'about'}
              onClick={this.onClickMenu}
            >
            About
          </Menu.Item>

          <Menu.Item
            name="cardview"
            active={activeItem === 'cardview'}
            onClick={this.onClickMenu}
          >
          Card View
          </Menu.Item>

          <Menu.Item
            name="listview"
            active={activeItem === 'listview'}
            onClick={this.onClickMenu}
            >
            List View
          </Menu.Item>

        </Menu>

        <Header as="h1" textAlign="center">
          Mercury Instrument Manager
        </Header>

        {React.cloneElement(this.props.children, this.props)}
      </Container>
    )
  }
}

export default Main;
