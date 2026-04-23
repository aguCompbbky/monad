// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

/**
 * @title GariEscrow
 * @notice Buyer-initiated single-transaction escrow.
 *   1. Buyer calls `lock(seller, pinHash)` with value = price. Funds are held in the contract.
 *   2. Buyer later calls `release(orderId, pinCode)`. If keccak256(abi.encodePacked(pinCode))
 *      matches the stored pinHash, funds are forwarded to the seller.
 *   3. If the buyer never gets the PIN, they can `refund(orderId)` after REFUND_DELAY.
 *
 * This contract is intentionally minimal and requires no action from the seller before a sale.
 */
contract GariEscrow {
    enum Status {
        None,
        Locked,
        Released,
        Refunded
    }

    struct Order {
        address buyer;
        address seller;
        uint256 amount;
        bytes32 pinHash;
        uint64 lockedAt;
        Status status;
    }

    uint256 public constant REFUND_DELAY = 7 days;

    uint256 public orderCount;
    mapping(uint256 => Order) public orders;

    event OrderLocked(
        uint256 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        bytes32 pinHash
    );
    event OrderReleased(uint256 indexed orderId, address indexed seller, uint256 amount);
    event OrderRefunded(uint256 indexed orderId, address indexed buyer, uint256 amount);

    /**
     * @notice Lock `msg.value` in escrow targeted at `seller`.
     *         The PIN that can release the funds is pre-committed via `pinHash`.
     * @return orderId The newly created order identifier.
     */
    function lock(address seller, bytes32 pinHash) external payable returns (uint256 orderId) {
        require(seller != address(0), "Seller required");
        require(seller != msg.sender, "Seller cannot buy own item");
        require(msg.value > 0, "Zero value");
        require(pinHash != bytes32(0), "PIN hash required");

        orderId = ++orderCount;
        orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            pinHash: pinHash,
            lockedAt: uint64(block.timestamp),
            status: Status.Locked
        });

        emit OrderLocked(orderId, msg.sender, seller, msg.value, pinHash);
    }

    /**
     * @notice Verify PIN and forward the escrowed amount to the seller.
     * @dev Only the original buyer can call this. Even if the PIN leaks,
     *      funds are always routed to the pre-declared seller.
     */
    function release(uint256 orderId, uint256 pinCode) external {
        Order storage order = orders[orderId];
        require(order.status == Status.Locked, "Order not locked");
        require(msg.sender == order.buyer, "Only buyer");
        require(keccak256(abi.encodePacked(pinCode)) == order.pinHash, "Invalid PIN");

        order.status = Status.Released;
        uint256 amount = order.amount;
        address seller = order.seller;

        (bool ok, ) = seller.call{value: amount}("");
        require(ok, "Transfer failed");

        emit OrderReleased(orderId, seller, amount);
    }

    /**
     * @notice Refund the buyer if the PIN never arrives. Available after REFUND_DELAY.
     */
    function refund(uint256 orderId) external {
        Order storage order = orders[orderId];
        require(order.status == Status.Locked, "Order not locked");
        require(msg.sender == order.buyer, "Only buyer");
        require(block.timestamp >= order.lockedAt + REFUND_DELAY, "Too early");

        order.status = Status.Refunded;
        uint256 amount = order.amount;

        (bool ok, ) = order.buyer.call{value: amount}("");
        require(ok, "Refund failed");

        emit OrderRefunded(orderId, order.buyer, amount);
    }
}
