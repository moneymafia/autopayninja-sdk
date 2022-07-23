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
        bytes32 hash,
        address indexed token,
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Init(
        bytes32 hash,
        address indexed token,
        address indexed owner,
        address indexed merchant,
        uint256 value
    );

    struct Plan {
        bytes32 hash;
        address token;
        address owner;
        address merchant;
        uint256 cost;
    }

    uint256 private secondsinday = 60 * 60 * 24;

    mapping(bytes32 => Plan) public subscriptions;

    mapping(bytes32 => uint256) public subsalive;

    bytes32[] public store;

    // get Store Length
    function storeLength() public view returns (uint256) {
        return store.length;
    }

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
    function canuserpay(bytes32 _hash, uint256 _days)
        public
        view
        returns (bool)
    {
        Plan memory subscription = subscriptions[_hash];

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
    function pending_secs(bytes32 _hash) public view returns (uint256) {
        if (block.timestamp > subsalive[_hash]) {
            return block.timestamp - subsalive[_hash];
        } else {
            return 0;
        }
    }

    //get hash for sub
    function hash_id(
        address _token,
        address _owner,
        address _merchant,
        uint256 _cost
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_token, _owner, _merchant, _cost));
    }

    // internal function - pays the merchent for the subscription
    function _safepay(
        bytes32 _hash,
        address _token,
        address _owner,
        address _merchant,
        uint256 _amount
    ) internal {
        require((_amount > 0), "0 Amount");

        require(
            (IERC20(_token).balanceOf(_owner) >= _amount),
            "Insufficient User Funds"
        );

        require(
            (IERC20(_token).allowance(_owner, address(this)) >= _amount),
            "Insufficient User Allowance"
        );

        IERC20(_token).transferFrom(_owner, _merchant, _amount);

        emit Transfer(_hash, _token, _owner, _merchant, _amount);
    }

    // initialize the subscription service /// _initdays should be 0 if no advance payment
    function txn_init(
        address _token,
        address _merchant,
        uint256 _cost,
        uint256 _initdays
    ) external {
        bytes32 sub_hash = hash_id(_token, msg.sender, _merchant, _cost);

        require((_cost > 0), "Cost must be greater than 0");

        Plan memory newSubscription = Plan({
            hash: sub_hash,
            owner: msg.sender,
            token: _token,
            merchant: _merchant,
            cost: _cost
        });

        subscriptions[sub_hash] = newSubscription;

        if (subsalive[sub_hash] < 100) {
            store.push(sub_hash);

            emit Init(sub_hash, _token, msg.sender, _merchant, _cost);
        }

        if (_initdays > 0) {
            _safepay(
                sub_hash,
                _token,
                msg.sender,
                _merchant,
                _cost * _initdays
            );
        }

        subsalive[sub_hash] = block.timestamp;
    }

    // close subscription
    function txn_close(bytes32 _hash) external {
        Plan storage subscription = subscriptions[_hash];

        require(
            (subscription.owner == msg.sender) ||
                (subscription.merchant == msg.sender)
        );

        delete subscriptions[_hash];
    }

    // process subscription
    function txn_run(bytes32 _hash, uint256 _days) external {
        Plan memory subscription = subscriptions[_hash];

        require(_days > 0);

        require((subscription.cost > 0), "Not an active subscription");

        require(
            (subsalive[_hash] + (secondsinday * _days) <= block.timestamp),
            "Subscription Not Timed"
        );

        _safepay(
            subscription.hash,
            subscription.token,
            subscription.owner,
            subscription.merchant,
            subscription.cost * _days
        );

        subsalive[_hash] = subsalive[_hash] + (secondsinday * _days);
    }
}
