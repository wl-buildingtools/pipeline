import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  del,
  requestBody,
} from '@loopback/rest';
import {PipeContainer, PipeFunction} from '../models';
import {PipeContainerRepository} from '../repositories';
import {AbiFunctionInput, AbiFunctionOuput, AbiFunction} from '../interfaces/abi';
import {
    DocParams,
    DocMethod,
    DocMethods,
    Devdoc,
    Userdoc,
} from '../interfaces/soldocs';


export class PipeContainerFunctionController {
  constructor(
    @repository(PipeContainerRepository)
    protected pipeContainerRepository: PipeContainerRepository,
  ) {}

  @post('/pipecontainer/{id}/pipefunction')
  async createFunction(
    @param.path.number('id') containerid: typeof PipeContainer.prototype._id,
    @requestBody() pipeFunctionData: PipeFunction,
  ): Promise<PipeFunction> {
    return await this.pipeContainerRepository.functions(containerid).create(pipeFunctionData);
  }

  @post('/pipecontainerfunctions')
  async createFunctions(
    @requestBody() pipeContainer: PipeContainer,
): Promise<PipeContainer> {
    let abi: AbiFunction[], devdoc: Devdoc, userdoc: Userdoc;
    let emptydoc = {methods: {}};
    let newContainer = await this.pipeContainerRepository.create(pipeContainer);

    abi = pipeContainer.abi || [];
    devdoc = pipeContainer.devdoc || emptydoc;
    userdoc = pipeContainer.userdoc || emptydoc;

    for (let i=0; i < abi.length; i++) {
        let funcabi: AbiFunction = abi[i];
        let signature, functiondoc;

        signature = funcabi.inputs.map((input: AbiFunctionInput) => input.type).join(',');
        signature = `${funcabi.name}(${signature})`;
        functiondoc = {
            signature,
            abiObj: funcabi,
            devdoc: devdoc.methods[signature],
            userdoc: userdoc.methods[signature],
            uri: pipeContainer.uri,
            tags: pipeContainer.tags,
            timestamp: pipeContainer.timestamp,
        }
        await this.pipeContainerRepository.functions(newContainer._id).create(functiondoc);
    };
    return newContainer;
  }
}