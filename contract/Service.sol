// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function balanceOf(address) external view returns (uint256);

    function transfer(address, uint256) external returns (bool);

    function allowance(address, address) external view returns (uint256);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);
}

contract Service {
    event Transfer(
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Init(
        uint256 id,
        address indexed token,
        address indexed owner,
        address indexed merchant,
        uint256 value
    );

    uint256 private secondsinday = 60;

    uint256 public sub_index;

    struct Plan {
        address owner;
        address token;
        address merchant;
        uint256 cost;
    }

    mapping(uint256 => Plan) public subscriptions;

    mapping(uint256 => uint256) public subsalive;

    // get user allowance for token
    function allowance(address _user, address _token)
        public
        view
        returns (uint256)
    {
        return IERC20(_token).allowance(_user, address(this));
    }

    // get user balance of token
    function balance_user(address _user, address _token)
        public
        view
        returns (uint256)
    {
        return IERC20(_token).balanceOf(_user);
    }

    // check if the user has enough tokens to pay for the subscription
    function canuserpay(uint256 _id, uint256 _days) public view returns (bool) {
        Plan memory subscription = subscriptions[_id];

        if (
            subscription.cost * _days <
            IERC20(subscription.token).allowance(
                subscription.owner,
                address(this)
            ) &&
            subscription.cost * _days <
            IERC20(subscription.token).balanceOf(subscription.owner)
        ) {
            return true;
        }

        return false;
    }

    // get the number of seconds unpaid in the subscription
    function pending_secs(uint256 _id) public view returns (uint256) {
        if (block.timestamp > subsalive[_id]) {
            return block.timestamp - subsalive[_id];
        } else {
            return 0;
        }
    }

    // internal function - pays the merchent for the subscription
    function _safepay(
        address _token,
        address _owner,
        address _merchant,
        uint256 _amount
    ) internal {
        require((_amount > 0), "Not an active subscription");

        require(
            (IERC20(_token).balanceOf(_owner) >= _amount),
            "Insufficient User Funds"
        );

        require(
            (IERC20(_token).allowance(_owner, address(this)) >= _amount),
            "Insufficient User Funds"
        );

        IERC20(_token).transferFrom(_owner, _merchant, _amount);

        emit Transfer(_token, _owner, _merchant, _amount);
    }

    // initialize the subscription service /// _initdays should be 0 if no advance payment
    function txn_init(
        address _token,
        address _merchant,
        uint256 _cost,
        uint256 _initdays
    ) external {
        require((_cost > 0), "Cost must be greater than 0");

        if (_initdays > 0) {
            _safepay(_token, msg.sender, _merchant, _cost * _initdays);
        }

        Plan memory newSubscription = Plan({
            owner: msg.sender,
            token: _token,
            merchant: _merchant,
            cost: _cost
        });

        subscriptions[sub_index] = newSubscription;

        subsalive[sub_index] = block.timestamp;

        emit Init(sub_index, _token, msg.sender, _merchant, _cost);

        sub_index += 1;
    }

    // close subscription
    function txn_close(uint256 _id) external {
        Plan storage subscription = subscriptions[_id];

        require(
            (subscription.owner == msg.sender) ||
                (subscription.merchant == msg.sender)
        );

        delete subscriptions[_id];
    }

    // process subscription
    function txn_run(uint256 _id, uint256 _days) external {
        Plan memory subscription = subscriptions[_id];

        require(_days > 0);

        require((subscription.cost > 0), "Not an active subscription");

        require(
            (subsalive[_id] + (secondsinday * _days) <= block.timestamp),
            "Subscription Not Timed"
        );

        _safepay(
            subscription.token,
            subscription.owner,
            subscription.merchant,
            subscription.cost * _days
        );

        subsalive[_id] = subsalive[_id] + (secondsinday * _days);
    }
}
