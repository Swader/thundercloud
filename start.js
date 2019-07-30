require('dotenv').config();
const ethers = require('ethers');
const fs = require('fs');
const keypair = require('@chainsafe/bls-js/lib/keypair');
const privateKey = require('@chainsafe/bls-js/lib/privateKey');
const bls = require('@chainsafe/bls-js');
const sha256 = require('js-sha256');
const ssz = require('@chainsafe/ssz');
const BN = require('bn.js');

// Deposit contract data
//const deposit_contract_bytecode = "0x740100000000000000000000000000000000000000006020526f7fffffffffffffffffffffffffffffff6040527fffffffffffffffffffffffffffffffff8000000000000000000000000000000060605274012a05f1fffffffffffffffffffffffffdabf41c006080527ffffffffffffffffffffffffed5fa0e000000000000000000000000000000000060a052341561009857600080fd5b6101406000601f818352015b600061014051602081106100b757600080fd5b600260c052602060c020015460208261016001015260208101905061014051602081106100e357600080fd5b600260c052602060c020015460208261016001015260208101905080610160526101609050602060c0825160208401600060025af161012157600080fd5b60c0519050606051600161014051018060405190131561014057600080fd5b809190121561014e57600080fd5b6020811061015b57600080fd5b600260c052602060c02001555b81516001018083528114156100a4575b505061124d56600035601c52740100000000000000000000000000000000000000006020526f7fffffffffffffffffffffffffffffff6040527fffffffffffffffffffffffffffffffff8000000000000000000000000000000060605274012a05f1fffffffffffffffffffffffffdabf41c006080527ffffffffffffffffffffffffed5fa0e000000000000000000000000000000000060a052600015610277575b6101605261014052600061018052610140516101a0526101c060006008818352015b61018051600860008112156100da578060000360020a82046100e1565b8060020a82025b905090506101805260ff6101a051166101e052610180516101e0516101805101101561010c57600080fd5b6101e0516101805101610180526101a0517ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff86000811215610155578060000360020a820461015c565b8060020a82025b905090506101a0525b81516001018083528114156100bd575b50506018600860208206610200016020828401111561019357600080fd5b60208061022082610180600060046015f15050818152809050905090508051602001806102c0828460006004600a8704601201f16101d057600080fd5b50506102c05160206001820306601f82010390506103206102c0516008818352015b826103205111156102025761021e565b6000610320516102e001535b81516001018083528114156101f2575b50505060206102a05260406102c0510160206001820306601f8201039050610280525b6000610280511115156102535761026f565b602061028051036102a001516020610280510361028052610241565b610160515650005b63863a311b600051141561050957341561029057600080fd5b6000610140526101405161016052600154610180526101a060006020818352015b60016001610180511614156103325760006101a051602081106102d357600080fd5b600060c052602060c02001546020826102400101526020810190506101605160208261024001015260208101905080610240526102409050602060c0825160208401600060025af161032457600080fd5b60c0519050610160526103a0565b6000610160516020826101c00101526020810190506101a0516020811061035857600080fd5b600260c052602060c02001546020826101c0010152602081019050806101c0526101c09050602060c0825160208401600060025af161039657600080fd5b60c0519050610160525b61018060026103ae57600080fd5b60028151048152505b81516001018083528114156102b1575b505060006101605160208261046001015260208101905061014051610160516101805163806732896102e05260015461030052610300516006580161009b565b506103605260006103c0525b6103605160206001820306601f82010390506103c0511015156104355761044e565b6103c05161038001526103c0516020016103c052610413565b61018052610160526101405261036060088060208461046001018260208501600060046012f150508051820191505060006018602082066103e0016020828401111561049957600080fd5b60208061040082610140600060046015f150508181528090509050905060188060208461046001018260208501600060046014f150508051820191505080610460526104609050602060c0825160208401600060025af16104f957600080fd5b60c051905060005260206000f350005b63621fd130600051141561061c57341561052257600080fd5b63806732896101405260015461016052610160516006580161009b565b506101c0526000610220525b6101c05160206001820306601f82010390506102205110151561056d57610586565b610220516101e00152610220516020016102205261054b565b6101c0805160200180610280828460006004600a8704601201f16105a957600080fd5b50506102805160206001820306601f82010390506102e0610280516008818352015b826102e05111156105db576105f7565b60006102e0516102a001535b81516001018083528114156105cb575b5050506020610260526040610280510160206001820306601f8201039050610260f350005b63c47e300d60005114156110c857605060043560040161014037603060043560040135111561064a57600080fd5b60406024356004016101c037602060243560040135111561066a57600080fd5b608060443560040161022037606060443560040135111561068a57600080fd5b63ffffffff6001541061069c57600080fd5b633b9aca006102e0526102e0516106b257600080fd5b6102e05134046102c052633b9aca006102c05110156106d057600080fd5b603061014051146106e057600080fd5b60206101c051146106f057600080fd5b6060610220511461070057600080fd5b610140610360525b6103605151602061036051016103605261036061036051101561072a57610708565b6380673289610380526102c0516103a0526103a0516006580161009b565b50610400526000610460525b6104005160206001820306601f8201039050610460511015156107765761078f565b6104605161042001526104605160200161046052610754565b610340610360525b61036051526020610360510361036052610140610360511015156107ba57610797565b610400805160200180610300828460006004600a8704601201f16107dd57600080fd5b5050610140610480525b61048051516020610480510161048052610480610480511015610809576107e7565b63806732896104a0526001546104c0526104c0516006580161009b565b50610520526000610580525b6105205160206001820306601f8201039050610580511015156108545761086d565b6105805161054001526105805160200161058052610832565b610460610480525b610480515260206104805103610480526101406104805110151561089857610875565b6105208051602001806105a0828460006004600a8704601201f16108bb57600080fd5b505060a06106205261062051610660526101408051602001806106205161066001828460006004600a8704601201f16108f357600080fd5b505061062051610660015160206001820306601f8201039050610620516106600161060081516040818352015b83610600511015156109315761094e565b6000610600516020850101535b8151600101808352811415610920575b50505050602061062051610660015160206001820306601f82010390506106205101016106205261062051610680526101c08051602001806106205161066001828460006004600a8704601201f16109a557600080fd5b505061062051610660015160206001820306601f8201039050610620516106600161060081516020818352015b83610600511015156109e357610a00565b6000610600516020850101535b81516001018083528114156109d2575b50505050602061062051610660015160206001820306601f820103905061062051010161062052610620516106a0526103008051602001806106205161066001828460006004600a8704601201f1610a5757600080fd5b505061062051610660015160206001820306601f8201039050610620516106600161060081516020818352015b8361060051101515610a9557610ab2565b6000610600516020850101535b8151600101808352811415610a84575b50505050602061062051610660015160206001820306601f820103905061062051010161062052610620516106c0526102208051602001806106205161066001828460006004600a8704601201f1610b0957600080fd5b505061062051610660015160206001820306601f8201039050610620516106600161060081516060818352015b8361060051101515610b4757610b64565b6000610600516020850101535b8151600101808352811415610b36575b50505050602061062051610660015160206001820306601f820103905061062051010161062052610620516106e0526105a08051602001806106205161066001828460006004600a8704601201f1610bbb57600080fd5b505061062051610660015160206001820306601f8201039050610620516106600161060081516020818352015b8361060051101515610bf957610c16565b6000610600516020850101535b8151600101808352811415610be8575b50505050602061062051610660015160206001820306601f8201039050610620510101610620527f649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c561062051610660a160006107005260006101406030806020846107c001018260208501600060046016f150508051820191505060006010602082066107400160208284011115610cad57600080fd5b60208061076082610700600060046015f15050818152809050905090506010806020846107c001018260208501600060046013f1505080518201915050806107c0526107c09050602060c0825160208401600060025af1610d0d57600080fd5b60c0519050610720526000600060406020820661086001610220518284011115610d3657600080fd5b606080610880826020602088068803016102200160006004601bf1505081815280905090509050602060c0825160208401600060025af1610d7657600080fd5b60c0519050602082610a600101526020810190506000604060206020820661092001610220518284011115610daa57600080fd5b606080610940826020602088068803016102200160006004601bf15050818152809050905090506020806020846109e001018260208501600060046015f1505080518201915050610700516020826109e0010152602081019050806109e0526109e09050602060c0825160208401600060025af1610e2757600080fd5b60c0519050602082610a6001015260208101905080610a6052610a609050602060c0825160208401600060025af1610e5e57600080fd5b60c0519050610840526000600061072051602082610b000101526020810190506101c0602080602084610b0001018260208501600060046015f150508051820191505080610b0052610b009050602060c0825160208401600060025af1610ec457600080fd5b60c0519050602082610c800101526020810190506000610300600880602084610c0001018260208501600060046012f15050805182019150506000601860208206610b800160208284011115610f1957600080fd5b602080610ba082610700600060046015f1505081815280905090509050601880602084610c0001018260208501600060046014f150508051820191505061084051602082610c0001015260208101905080610c0052610c009050602060c0825160208401600060025af1610f8c57600080fd5b60c0519050602082610c8001015260208101905080610c8052610c809050602060c0825160208401600060025af1610fc357600080fd5b60c0519050610ae0526001805460018254011015610fe057600080fd5b6001815401815550600154610d0052610d2060006020818352015b60016001610d005116141561103057610ae051610d20516020811061101f57600080fd5b600060c052602060c02001556110c4565b6000610d20516020811061104357600080fd5b600060c052602060c0200154602082610d40010152602081019050610ae051602082610d4001015260208101905080610d4052610d409050602060c0825160208401600060025af161109457600080fd5b60c0519050610ae052610d0060026110ab57600080fd5b60028151048152505b8151600101808352811415610ffb575b5050005b60006000fd5b61017f61124d0361017f60003961017f61124d036000f3";
const deposit_contract_bytecode = "0x740100000000000000000000000000000000000000006020526f7fffffffffffffffffffffffffffffff6040527fffffffffffffffffffffffffffffffff8000000000000000000000000000000060605274012a05f1fffffffffffffffffffffffffdabf41c006080527ffffffffffffffffffffffffed5fa0e000000000000000000000000000000000060a052341561009857600080fd5b6101406000601f818352015b600061014051602081106100b757600080fd5b600260c052602060c020015460208261016001015260208101905061014051602081106100e357600080fd5b600260c052602060c020015460208261016001015260208101905080610160526101609050602060c0825160208401600060025af161012157600080fd5b60c0519050606051600161014051018060405190131561014057600080fd5b809190121561014e57600080fd5b6020811061015b57600080fd5b600260c052602060c02001555b81516001018083528114156100a4575b505061134d56600035601c52740100000000000000000000000000000000000000006020526f7fffffffffffffffffffffffffffffff6040527fffffffffffffffffffffffffffffffff8000000000000000000000000000000060605274012a05f1fffffffffffffffffffffffffdabf41c006080527ffffffffffffffffffffffffed5fa0e000000000000000000000000000000000060a052600015610277575b6101605261014052600061018052610140516101a0526101c060006008818352015b61018051600860008112156100da578060000360020a82046100e1565b8060020a82025b905090506101805260ff6101a051166101e052610180516101e0516101805101101561010c57600080fd5b6101e0516101805101610180526101a0517ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff86000811215610155578060000360020a820461015c565b8060020a82025b905090506101a0525b81516001018083528114156100bd575b50506018600860208206610200016020828401111561019357600080fd5b60208061022082610180600060046015f15050818152809050905090508051602001806102c0828460006004600a8704601201f16101d057600080fd5b50506102c05160206001820306601f82010390506103206102c0516008818352015b826103205111156102025761021e565b6000610320516102e001535b81516001018083528114156101f2575b50505060206102a05260406102c0510160206001820306601f8201039050610280525b6000610280511115156102535761026f565b602061028051036102a001516020610280510361028052610241565b610160515650005b63863a311b600051141561050957341561029057600080fd5b6000610140526101405161016052600154610180526101a060006020818352015b60016001610180511614156103325760006101a051602081106102d357600080fd5b600060c052602060c02001546020826102400101526020810190506101605160208261024001015260208101905080610240526102409050602060c0825160208401600060025af161032457600080fd5b60c0519050610160526103a0565b6000610160516020826101c00101526020810190506101a0516020811061035857600080fd5b600260c052602060c02001546020826101c0010152602081019050806101c0526101c09050602060c0825160208401600060025af161039657600080fd5b60c0519050610160525b61018060026103ae57600080fd5b60028151048152505b81516001018083528114156102b1575b505060006101605160208261046001015260208101905061014051610160516101805163806732896102e05260015461030052610300516006580161009b565b506103605260006103c0525b6103605160206001820306601f82010390506103c0511015156104355761044e565b6103c05161038001526103c0516020016103c052610413565b61018052610160526101405261036060088060208461046001018260208501600060046012f150508051820191505060006018602082066103e0016020828401111561049957600080fd5b60208061040082610140600060046015f150508181528090509050905060188060208461046001018260208501600060046014f150508051820191505080610460526104609050602060c0825160208401600060025af16104f957600080fd5b60c051905060005260206000f350005b63621fd130600051141561061c57341561052257600080fd5b63806732896101405260015461016052610160516006580161009b565b506101c0526000610220525b6101c05160206001820306601f82010390506102205110151561056d57610586565b610220516101e00152610220516020016102205261054b565b6101c0805160200180610280828460006004600a8704601201f16105a957600080fd5b50506102805160206001820306601f82010390506102e0610280516008818352015b826102e05111156105db576105f7565b60006102e0516102a001535b81516001018083528114156105cb575b5050506020610260526040610280510160206001820306601f8201039050610260f350005b63c47e300d60005114156111c857605060043560040161014037603060043560040135111561064a57600080fd5b60406024356004016101c037602060243560040135111561066a57600080fd5b608060443560040161022037606060443560040135111561068a57600080fd5b63ffffffff6001541061069c57600080fd5b633b9aca006102e0526102e0516106b257600080fd5b6102e05134046102c0526308c379a061030052602061032052601b610340527f4d696e696d756d206465706f736974206e6f74207265616368656400000000006103605261034050633b9aca006102c051101561071057608461031cfd5b6308c379a06103a05260206103c05260156103e0527f5075626b6579206c656e20697320696e76616c69640000000000000000000000610400526103e050603061014051146107605760846103bcfd5b6308c379a061044052602061046052601c610480527f57697468647261772063726564206c656e20697320696e76616c6964000000006104a0526104805060206101c051146107b057608461045cfd5b6308c379a06104e0526020610500526012610520527f536967206c656e67746820696e76616c696400000000000000000000000000006105405261052050606061022051146108005760846104fcfd5b6101406105e0525b6105e0515160206105e051016105e0526105e06105e051101561082a57610808565b6380673289610600526102c05161062052610620516006580161009b565b506106805260006106e0525b6106805160206001820306601f82010390506106e0511015156108765761088f565b6106e0516106a001526106e0516020016106e052610854565b6105c06105e0525b6105e0515260206105e051036105e0526101406105e0511015156108ba57610897565b610680805160200180610580828460006004600a8704601201f16108dd57600080fd5b5050610140610700525b61070051516020610700510161070052610700610700511015610909576108e7565b63806732896107205260015461074052610740516006580161009b565b506107a0526000610800525b6107a05160206001820306601f8201039050610800511015156109545761096d565b610800516107c001526108005160200161080052610932565b6106e0610700525b610700515260206107005103610700526101406107005110151561099857610975565b6107a0805160200180610820828460006004600a8704601201f16109bb57600080fd5b505060a06108a0526108a0516108e0526101408051602001806108a0516108e001828460006004600a8704601201f16109f357600080fd5b50506108a0516108e0015160206001820306601f82010390506108a0516108e00161088081516040818352015b8361088051101515610a3157610a4e565b6000610880516020850101535b8151600101808352811415610a20575b5050505060206108a0516108e0015160206001820306601f82010390506108a05101016108a0526108a051610900526101c08051602001806108a0516108e001828460006004600a8704601201f1610aa557600080fd5b50506108a0516108e0015160206001820306601f82010390506108a0516108e00161088081516020818352015b8361088051101515610ae357610b00565b6000610880516020850101535b8151600101808352811415610ad2575b5050505060206108a0516108e0015160206001820306601f82010390506108a05101016108a0526108a051610920526105808051602001806108a0516108e001828460006004600a8704601201f1610b5757600080fd5b50506108a0516108e0015160206001820306601f82010390506108a0516108e00161088081516020818352015b8361088051101515610b9557610bb2565b6000610880516020850101535b8151600101808352811415610b84575b5050505060206108a0516108e0015160206001820306601f82010390506108a05101016108a0526108a051610940526102208051602001806108a0516108e001828460006004600a8704601201f1610c0957600080fd5b50506108a0516108e0015160206001820306601f82010390506108a0516108e00161088081516060818352015b8361088051101515610c4757610c64565b6000610880516020850101535b8151600101808352811415610c36575b5050505060206108a0516108e0015160206001820306601f82010390506108a05101016108a0526108a051610960526108208051602001806108a0516108e001828460006004600a8704601201f1610cbb57600080fd5b50506108a0516108e0015160206001820306601f82010390506108a0516108e00161088081516020818352015b8361088051101515610cf957610d16565b6000610880516020850101535b8151600101808352811415610ce8575b5050505060206108a0516108e0015160206001820306601f82010390506108a05101016108a0527f649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c56108a0516108e0a16000610980526000610140603080602084610a4001018260208501600060046016f150508051820191505060006010602082066109c00160208284011115610dad57600080fd5b6020806109e082610980600060046015f1505081815280905090509050601080602084610a4001018260208501600060046013f150508051820191505080610a4052610a409050602060c0825160208401600060025af1610e0d57600080fd5b60c05190506109a05260006000604060208206610ae001610220518284011115610e3657600080fd5b606080610b00826020602088068803016102200160006004601bf1505081815280905090509050602060c0825160208401600060025af1610e7657600080fd5b60c0519050602082610ce001015260208101905060006040602060208206610ba001610220518284011115610eaa57600080fd5b606080610bc0826020602088068803016102200160006004601bf1505081815280905090509050602080602084610c6001018260208501600060046015f150508051820191505061098051602082610c6001015260208101905080610c6052610c609050602060c0825160208401600060025af1610f2757600080fd5b60c0519050602082610ce001015260208101905080610ce052610ce09050602060c0825160208401600060025af1610f5e57600080fd5b60c0519050610ac052600060006109a051602082610d800101526020810190506101c0602080602084610d8001018260208501600060046015f150508051820191505080610d8052610d809050602060c0825160208401600060025af1610fc457600080fd5b60c0519050602082610f000101526020810190506000610580600880602084610e8001018260208501600060046012f15050805182019150506000601860208206610e00016020828401111561101957600080fd5b602080610e2082610980600060046015f1505081815280905090509050601880602084610e8001018260208501600060046014f1505080518201915050610ac051602082610e8001015260208101905080610e8052610e809050602060c0825160208401600060025af161108c57600080fd5b60c0519050602082610f0001015260208101905080610f0052610f009050602060c0825160208401600060025af16110c357600080fd5b60c0519050610d605260018054600182540110156110e057600080fd5b6001815401815550600154610f8052610fa060006020818352015b60016001610f805116141561113057610d6051610fa0516020811061111f57600080fd5b600060c052602060c02001556111c4565b6000610fa0516020811061114357600080fd5b600060c052602060c0200154602082610fc0010152602081019050610d6051602082610fc001015260208101905080610fc052610fc09050602060c0825160208401600060025af161119457600080fd5b60c0519050610d6052610f8060026111ab57600080fd5b60028151048152505b81516001018083528114156110fb575b5050005b60006000fd5b61017f61134d0361017f60003961017f61134d036000f3";
//const deposit_contract_abi = '[{"name": "DepositEvent", "inputs": [{"type": "bytes", "name": "pubkey", "indexed": false}, {"type": "bytes", "name": "withdrawal_credentials", "indexed": false}, {"type": "bytes", "name": "amount", "indexed": false}, {"type": "bytes", "name": "signature", "indexed": false}, {"type": "bytes", "name": "index", "indexed": false}], "anonymous": false, "type": "event"}, {"outputs": [], "inputs": [], "constant": false, "payable": false, "type": "constructor"}, {"name": "get_hash_tree_root", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 91707}, {"name": "get_deposit_count", "outputs": [{"type": "bytes", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 10463}, {"name": "deposit", "outputs": [], "inputs": [{"type": "bytes", "name": "pubkey"}, {"type": "bytes", "name": "withdrawal_credentials"}, {"type": "bytes", "name": "signature"}], "constant": false, "payable": true, "type": "function", "gas": 1334230}]';
const deposit_contract_abi = '[{"name": "DepositEvent", "inputs": [{"type": "bytes", "name": "pubkey", "indexed": false}, {"type": "bytes", "name": "withdrawal_credentials", "indexed": false}, {"type": "bytes", "name": "amount", "indexed": false}, {"type": "bytes", "name": "signature", "indexed": false}, {"type": "bytes", "name": "index", "indexed": false}], "anonymous": false, "type": "event"}, {"outputs": [], "inputs": [], "constant": false, "payable": false, "type": "constructor"}, {"name": "get_hash_tree_root", "outputs": [{"type": "bytes32", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 91707}, {"name": "get_deposit_count", "outputs": [{"type": "bytes", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 10463}, {"name": "deposit", "outputs": [], "inputs": [{"type": "bytes", "name": "pubkey"}, {"type": "bytes", "name": "withdrawal_credentials"}, {"type": "bytes", "name": "signature"}], "constant": false, "payable": true, "type": "function", "gas": 1334488}]';

// Command-line arguments parser
var args = process.argv.slice(2);
var arglist = {};
args.forEach(function (val, index, array) {
	if (val.indexOf("=") > -1) {
		let splitArg = val.split("=");
		arglist[splitArg[0]] = splitArg[1];
	} else {
		arglist[val] = true;
	}
});

// @TODO make faucet balance configurable
const startupOptions = {
	"mnemonic": process.env.mnemonic,
	"default_balance_ether": 1000000,
	"total_accounts": 1,
	"db_path": "./deploy/db",
	"network_id": 666,
	"account_keys_path": "./deploy/keys/validators.json" // Does not work yet: https://github.com/trufflesuite/ganache-cli/issues/663
};

// Default to 10 accounts if no options provided
if (!arglist.v && !arglist.mykeys) {
	console.log("No number of auto-generated accounts specified, and no custom keys provided. Defaulting to 10 accounts.");
	arglist.v = 10;
}

// Generate `v` number of accounts with 32.1 ether each
var accounts = [];
if (arglist.v && arglist.v > 0) {
	accounts.push({"balance": 0xD3C21BCECCEDA1000000});
	console.log("Creating " + arglist.v + " validator accounts and making deposits for them. Find their private keys in deploy/keys");
	for (var i = 0; i < arglist.v; i++) {
		accounts.push({"balance": 0x1BD7A1BED4A0A0000}); // 32.1 ether to each validator
	}
	startupOptions.accounts = accounts;
}

// Feed all accounts in `.mykeys` with 32.1 ether
var myAccounts = [];
var mykeys;
if (arglist.mykeys) {
	try {
		mykeys = require("./.mykeys.json");
	} catch (e) {
		console.error("Did you make sure .mykeys exists in this folder before running the command with the mykeys flag?");
		return;
	}

	for (var key in mykeys) {
		if (mykeys.hasOwnProperty(key)) {
			console.log("Queueing account " + key);
			myAccounts.push({"balance": 0x1BD7A1BED4A0A0000, "secretKey": mykeys[key]});
		}
	}
	
	if (startupOptions.hasOwnProperty("accounts")) {
		console.log("Merging own keys with pre-generated");
		startupOptions.accounts = startupOptions.accounts.concat(myAccounts);
	} else {
		console.log("Generating faucet account and appending queued keys.");
		myAccounts.unshift({"balance": 0xD3C21BCECCEDA1000000});
		startupOptions.accounts = myAccounts;
	}
}

// Bootstrap Ganache
console.log("Bootstrapping with options:");
console.log(startupOptions);
const ganache = require("ganache-cli");
const provider = new ethers.providers.Web3Provider(ganache.provider(startupOptions));

// Seed and export faucet account
var faucetAmount;
provider.listAccounts().then(function(result){
	provider.getBalance(result[0]).then(function(balanceResult) {

		faucetAmount = balanceResult / 1e18;

		let mnemonic = process.env.mnemonic;
		let mnemonicWallet = ethers.Wallet.fromMnemonic(mnemonic);
		
		fs.writeFile("deploy/keys/faucetkey.txt", mnemonicWallet.privateKey + ":" + mnemonicWallet.address, function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("Private key of faucet account "+ result[0] +" now in /deploy/keys/faucetkey.txt. It is seeded with ~" + faucetAmount + " ether.");
		}); 

		deployDepositContract(mnemonicWallet.privateKey).then(makeValidatorDeposits);
	});

});

let contractAddress;
// Deploy deposit contract, precompiled, save its address into a file
async function deployDepositContract(pk) {
	if (fs.existsSync("./deploy/keys/deposit_contract.txt")) {

		let path = process.cwd();
		let buffer = fs.readFileSync(path + "/deploy/keys/deposit_contract.txt");
		contractAddress = buffer.toString();

		console.log("Contract address exists (" + contractAddress + "), indicating contract already deployed. Skipping contract generation.");
		return false;

	} else {
		let factory = new ethers.ContractFactory(deposit_contract_abi, deposit_contract_bytecode, new ethers.Wallet(pk, provider));
		let contract = await factory.deploy();
		contractAddress = contract.address;
		console.log("Contract will be generated at " + contract.address + " when TX " + contract.deployTransaction.hash) + " is mined.";
		
		fs.writeFile("deploy/keys/deposit_contract.txt", contract.address, function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("Contract address saved in deploy/keys.");
		}); 

		await contract.deployed().then(function(){console.log("Contract deployed and ready.")});
	}
}

async function makeValidatorDeposits() {

	let totalCounter= 0;

	let accountMasterList = [];

	if (arglist.v) {
		console.log("Generating keys for "+ arglist.v +" auto-generated accounts");
		for (var i = 0; i <= arglist.v; i++) {
			let mnemonicWallet = new ethers.Wallet.fromMnemonic(process.env.mnemonic, "m/44'/60'/0'/0/"+i);
			let pk = mnemonicWallet.privateKey;

			let bls_key_sign = new keypair.Keypair(privateKey.PrivateKey.fromHexString(pk)).privateKey.toHexString();
			let bls_key_withdraw = new keypair.Keypair(privateKey.PrivateKey.fromHexString(invertHex(pk))).privateKey.toHexString();

			accountMasterList.push({
				address: mnemonicWallet.address,
				pk: pk,
				bls_key_sign: bls_key_sign,
				bls_key_withdraw, bls_key_withdraw
			});
		}
	}

	if (arglist.mykeys) {
		console.log("Generating keys for " + Object.keys(mykeys).length + " pre-provided accounts");
		for (var key in mykeys) {
			if (mykeys.hasOwnProperty(key)) {
				let pkWallet = new ethers.Wallet(mykeys[key]);
				pk = pkWallet.privateKey;

				let bls_key_sign = new keypair.Keypair(privateKey.PrivateKey.fromHexString(pk)).privateKey.toHexString();
				let bls_key_withdraw = new keypair.Keypair(privateKey.PrivateKey.fromHexString(invertHex(pk))).privateKey.toHexString();
	
				accountMasterList.push({
					address: key,
					pk: pk,
					bls_key_sign: bls_key_sign,
					bls_key_withdraw, bls_key_withdraw
				});
			}
		}
	}
	
	console.log("Saving keys to file");
	fs.writeFile("deploy/keys/validators.json", JSON.stringify(accountMasterList), function(err) {
		if(err) {
			return console.log(err);
		}
		console.log("Validator list saved in deploy/keys/validators.json.");
	}); 

	console.log("Starting validator deposits");	

	let contract = new ethers.Contract(contractAddress, deposit_contract_abi, provider);
	accountMasterList.forEach(async function(item, ind) {

		if (ind === 0) {
			console.log("Skipping first account - that's the faucet.")
			return;
		}

		// A signer is needed to sign a transaction from a given account
		let wallet = new ethers.Wallet(item.pk, provider);

		let bal = await wallet.getBalance();

		//console.log("Checking balance for address " + wallet.address +". It's " + bal + "(" + ethers.utils.formatEther(bal) + "eth)");
		if (ethers.utils.formatEther(bal) < 32) {
			console.log(wallet.address + " already deposited the ether. Skipping.");
			checkServerStart();
			return;
		}

		// 48 byte public key for signing
		let signkeys = new keypair.Keypair(privateKey.PrivateKey.fromHexString(item.bls_key_sign));
		let sign_pubkey = signkeys.publicKey.toBytesCompressed();
		let sign_prikey = signkeys.privateKey.toBytes();

		// 48 byte public key for withdrawing
		let withdraw_pubkey = new keypair.Keypair(privateKey.PrivateKey.fromHexString(item.bls_key_withdraw)).publicKey.toHexString();

		// Withdrawal credentials is the sha256 hash of the withdrawal pubkey (32 bytes), but the first byte of the hash is replaced with the prefix (currently 0 for version 0)
		let withdrawal_credentials_hex = "0x00" + sha256.sha256(withdraw_pubkey).slice(2); // 32 byte output
		let withdrawal_credentials = Buffer.from(sha256.arrayBuffer(withdraw_pubkey));
		withdrawal_credentials[0] = 0;

		// Signature is technically bls_sign(signing_privkey, signing_root(deposit_data)) but due to the circular dependency the signature here is actually ignored (!!) and can be nothing, null, or random data.
		let signature_dd = Buffer.alloc(0);

		// Put it together somehow
		let depositData = {
			pubkey: sign_pubkey,
			withdrawalCredentials: withdrawal_credentials,
			signature: signature_dd,
			amount: new BN("32000000000")
		}

		//console.log(depositData);
		//console.log(sign_prikey);

		// Signature for Deposit call
		let signature_d = bls.default.sign(sign_prikey, ssz.signingRoot(depositData, {
			fields: [
			  ["pubkey", "bytes48"],
			  ["withdrawalCredentials", "bytes32"],
			  ["amount", "uint64"],
			  ["signature", "bytes96"],
			],
		  }), new BN('3').toBuffer('le', 8));

		contract = contract.connect(wallet);
		let tx = contract.deposit(signkeys.publicKey.toHexString(), withdrawal_credentials_hex, signature_d, {
			value: ethers.utils.parseEther('32.0'),
			gasLimit: 230000,
			gasPrice: ethers.utils.parseUnits('20', 'gwei'),
		}).then(function(result) {
			console.log("Validator #" + ind + ": " + wallet.address + " queued up with 32 ether.");
			checkServerStart();
		});

		function checkServerStart() {
			totalCounter++;
			if (totalCounter == accountMasterList.length - 1) {
				serverStart();
			}
		}
		
	});}

async function serverStart() {
	const server = ganache.server(startupOptions);
	server.listen(8545, function(err, blockchain) {
		// The server starts, you can connect to it with RPC now.
		console.log("Server is running, feel free to connect!");

		provider.getBalance(contractAddress).then(function(result) {
			console.log("The deposit contract contains " +  ethers.utils.formatUnits(result , "ether") + " Ether");
		});
	});
}

function invertHex(hexString) {
	hexString = hexString.replace("0x", "");
	return "0x" + hexString.split("").reverse().join("");
}