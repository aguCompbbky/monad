//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract YourContract {
    enum OrderStatus {
        Created,
        Funded,
        Shipped,
        Completed,
        Cancelled
    }

    struct Order {
        address seller;
        address buyer;
        uint256 itemPrice;
        uint256 sellerDeposit;
        bytes32 deliveryQrHash;
        string itemMetadata;
        OrderStatus status;
    }

    uint256 public constant DEPOSIT_BPS = 1000; // 10%
    uint256 public orderCount;
    mapping(uint256 => Order) public orders;

    event OrderCreated(
        uint256 indexed orderId,
        address indexed seller,
        address indexed buyer,
        uint256 itemPrice,
        uint256 sellerDeposit
    );
    event OrderFunded(uint256 indexed orderId, address indexed buyer, uint256 amount);
    event OrderShipped(uint256 indexed orderId);
    event OrderCompleted(uint256 indexed orderId, uint256 sellerPayout);
    event OrderCancelled(uint256 indexed orderId);

    function calculateRequiredDeposit(uint256 itemPrice) public pure returns (uint256) {
        return (itemPrice * DEPOSIT_BPS) / 10000;
    }

    function createOrder(
        address buyer,
        uint256 itemPrice,
        bytes32 deliveryQrHash,
        string calldata itemMetadata
    ) external payable returns (uint256) {
        require(buyer != address(0), "Buyer required");
        require(itemPrice > 0, "Price required");
        require(deliveryQrHash != bytes32(0), "QR hash required");

        uint256 requiredDeposit = calculateRequiredDeposit(itemPrice);
        require(msg.value == requiredDeposit, "Invalid deposit amount");

        uint256 orderId = ++orderCount;
        orders[orderId] = Order({
            seller: msg.sender,
            buyer: buyer,
            itemPrice: itemPrice,
            sellerDeposit: msg.value,
            deliveryQrHash: deliveryQrHash,
            itemMetadata: itemMetadata,
            status: OrderStatus.Created
        });

        emit OrderCreated(orderId, msg.sender, buyer, itemPrice, msg.value);
        return orderId;
    }

    function fundOrder(uint256 orderId) external payable {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Created, "Order not fundable");
        require(msg.sender == order.buyer, "Only buyer");
        require(msg.value == order.itemPrice, "Invalid payment amount");

        order.status = OrderStatus.Funded;
        emit OrderFunded(orderId, msg.sender, msg.value);
    }

    function markShipped(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Funded, "Order not funded");
        require(msg.sender == order.seller, "Only seller");

        order.status = OrderStatus.Shipped;
        emit OrderShipped(orderId);
    }

    function confirmDelivery(uint256 orderId, string calldata qrCodeRaw) external {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Shipped, "Order not shipped");
        require(msg.sender == order.buyer, "Only buyer");
        require(keccak256(bytes(qrCodeRaw)) == order.deliveryQrHash, "Invalid QR");

        order.status = OrderStatus.Completed;
        uint256 payout = order.itemPrice + order.sellerDeposit;
        _safeTransfer(order.seller, payout);

        emit OrderCompleted(orderId, payout);
    }

    function cancelOrder(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Created, "Cannot cancel");
        require(msg.sender == order.seller, "Only seller");

        order.status = OrderStatus.Cancelled;
        _safeTransfer(order.seller, order.sellerDeposit);

        emit OrderCancelled(orderId);
    }

    function _safeTransfer(address to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
    }
}
